import { Server } from '@grpc/grpc-js'
import { v2 } from '@google-cloud/run'

import { initializeServer, shutdownServer, startServer } from '../src/server'
import { docker } from '../src/utils/docker'
import { Config, getConfig } from '../src/utils/config'
import { getLogger } from '@utils/logger'

describe('JobsService', () => {
  let config: Config
  let server: Server
  let client: v2.JobsClient

  beforeEach(async () => {
    config = getConfig()
    server = initializeServer()
    await startServer(server)

    client = new v2.JobsClient({
      servicePath: '0.0.0.0',
      port: 8123,
      sslCreds: (new v2.JobsClient() as any)._gaxGrpc.grpc.credentials.createInsecure()
    })
  })

  afterEach(async () => {
    await shutdownServer(server)
    server = undefined

    await client.close()
    client = undefined
  })

  describe('RunJob', () => {
    it('throws an error when an non-existent job name is given', async () => {
      delete config.jobs['this-job-does-not-exist']
      await expect(client.runJob({ name: 'this-job-does-not-exist' })).rejects.toThrow()
    })
  })
})

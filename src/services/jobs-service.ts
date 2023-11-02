import { loadPackageDefinition } from '@grpc/grpc-js'
import { protos } from '@google-cloud/run'
import { loadSync } from '@grpc/proto-loader'
import { getProtoPath } from 'google-proto-files'

import { docker, streamContainerLogs } from '@utils/docker'
import { handler } from '@utils/grpc'
import { getConfig } from '@utils/config'
import { Logger, getLogger } from '@utils/logger'

export const jobsServiceDefinitions = loadPackageDefinition(
  loadSync(
    getProtoPath('cloud/run/v2/job.proto'),
    {
      includeDirs: [
        'node_modules/google-proto-files'
      ]
    }
  )
)

export const JobsService = {
  RunJob: handler<protos.google.cloud.run.v2.RunJobRequest, protos.google.longrunning.Operation>(async (call) => {
    const config = getConfig()
    const logger = getLogger(Logger.Job)

    if (!Object.hasOwnProperty.call(config.jobs, call.request.name)) {
      throw new Error('Unknown Job')
    }

    const job = config.jobs[call.request.name]
    logger.info({ name: call.request.name, ...job }, `running job ${call.request.name}`)

    const container = await docker.createContainer({
      Image: job.image,
    })

    await container.start()
    await streamContainerLogs(container, logger)

    const { StatusCode } = await container.wait()
    if (StatusCode !== 0) {
      throw new Error(`failed to run job ${call.request.name}, container exited with status ${StatusCode}`)
    }

    return new protos.google.longrunning.Operation({
      response: {}
    })
  })
}

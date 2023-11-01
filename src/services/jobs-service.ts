import { loadPackageDefinition } from '@grpc/grpc-js'
import { protos } from '@google-cloud/run'
import { loadSync } from '@grpc/proto-loader'
import { getProtoPath } from 'google-proto-files'

import { docker } from '@clients/docker'
import { handler } from '@utils/grpc'

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
    return new protos.google.longrunning.Operation({
      response: {}
    })
  })
}

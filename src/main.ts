import { Server, ServerCredentials, ServiceDefinition, UntypedServiceImplementation } from '@grpc/grpc-js'

import { getLogger } from '@services/logger'
import { jobsServiceDefinitions, JobsService } from '@services/jobs-service'

!(async () => {
  const logger = getLogger()
  const server = new Server()

  server.addService(
    // GrpcObject does not like the nested namespace
    (jobsServiceDefinitions.google as any).cloud.run.v2.Jobs.service as ServiceDefinition<UntypedServiceImplementation>,
    JobsService,
  )

  logger.info('starting gRPC server ...')

  try {
    const port = await new Promise((resolve, reject) => {
      server.bindAsync(`0.0.0.0:${process.env.PORT ?? '8123'}`, ServerCredentials.createInsecure(), (err, port) => {
        if (err) {
          return reject(err)
        }
  
        return resolve(port)
      })
    })

    server.start()

    logger.info({ port }, `⚡ up and running on 0.0.0.0:${port}`)
  } catch (err) {
    logger.error({ err }, `failed to start gRPC server`)
    process.exit(1)
  }
})()

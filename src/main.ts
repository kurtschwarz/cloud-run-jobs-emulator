import { Server, ServerCredentials, ServiceDefinition, UntypedServiceImplementation } from '@grpc/grpc-js'

import { getLogger } from '@utils/logger'
import { getConfig } from '@utils/config'
import { jobsServiceDefinitions, JobsService } from '@services/jobs-service'

!(async () => {
  const config = getConfig()
  const logger = getLogger()
  const server = new Server()

  logger.info('starting gRPC server ...')

  if (Object.keys(config.jobs)?.length === 0) {
    logger.warn({}, 'no jobs defined in config')
  }

  server.addService(
    // GrpcObject does not like the nested namespace
    (jobsServiceDefinitions.google as any).cloud.run.v2.Jobs.service as ServiceDefinition<UntypedServiceImplementation>,
    JobsService,
  )

  try {
    const port = await new Promise((resolve, reject) => {
      server.bindAsync(`${config.host}:${config.port}`, ServerCredentials.createInsecure(), (err, port) => {
        if (err) {
          return reject(err)
        }
  
        return resolve(port)
      })
    })

    server.start()

    logger.info({ address: `${config.host}:${port}` }, `⚡ up and running on ${config.host}:${port}`)
  } catch (err) {
    logger.error({ err }, `failed to start gRPC server`)
    process.exit(1)
  }
})()

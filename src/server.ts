import { Server, ServerCredentials, ServiceDefinition, UntypedServiceImplementation } from '@grpc/grpc-js'

import { JobsService, jobsServiceDefinitions } from '@services/jobs-service'
import { getConfig } from '@utils/config'

export const initializeServer = (): Server => {
  const server = new Server()

  server.addService(
    // GrpcObject does not like the nested namespace
    (jobsServiceDefinitions.google as any).cloud.run.v2.Jobs.service as ServiceDefinition<UntypedServiceImplementation>,
    JobsService,
  )

  return server
}

export const startServer = async (server: Server): Promise<Server> => {
  const config = getConfig()

  await new Promise((resolve, reject) => {
    server.bindAsync(`${config.host}:${config.port}`, ServerCredentials.createInsecure(), (err, port) => {
      if (err) {
        return reject(err)
      }

      return resolve(port)
    })
  })

  server.start()

  return server
}

export const shutdownServer = async (server: Server): Promise<Server> => {
  await new Promise((resolve, reject) => {
    try {
      server.tryShutdown((err) => {
        if (err) {
          return reject(err)
        }

        return resolve(true)
      })
    } catch (err) {
      if (server) {
        server.forceShutdown()
      }
    }
  })

  return server
}

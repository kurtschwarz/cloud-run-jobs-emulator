import { getLogger } from '@utils/logger'
import { getConfig } from '@utils/config'

import { initializeServer, startServer } from './server'

!(async () => {
  const config = getConfig()
  const logger = getLogger()
  const server = initializeServer()

  logger.info('starting gRPC server ...')

  if (Object.keys(config.jobs)?.length === 0) {
    logger.warn({}, 'no jobs defined in config')
  }

  try {
    await startServer(server)

    logger.info({ address: `${config.host}:${config.port}` }, `⚡ up and running on ${config.host}:${config.port}`)
  } catch (err) {
    logger.error({ err }, `failed to start gRPC server`)
    process.exit(1)
  }
})()

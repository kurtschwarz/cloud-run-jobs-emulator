import Docker, { Container } from 'dockerode'
import { PassThrough } from 'stream'

import { getLogger, Logger } from '@utils/logger'
import pino from 'pino'

export const docker = new Docker()

export const streamContainerLogs = async (
  container: Container,
  logger: pino.Logger = getLogger(Logger.Job),
): Promise<void> => {
  const stream = new PassThrough()

  stream.on('data', (chunk) => {
    logger.info(chunk.toString('utf8').trim())
  })

  const logs = await container.logs({
    follow: true,
    stderr: true,
    stdout: true,
  })

  logs.on('end', () => stream.end('!stop!'))

  container.modem.demuxStream(logs, stream, stream)

  return
}

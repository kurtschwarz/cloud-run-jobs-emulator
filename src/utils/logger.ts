import pino from 'pino'

export enum Logger {
  Job = 'job',
  Default = 'default'
}

const levels = new Map<Logger, string>([
  [Logger.Job, 'info'],
  [Logger.Default, 'info'],
])

const loggers = new Map<Logger, pino.Logger>([])

export const getLogger = (name: Logger = Logger.Default, base: { [key: string]: any } = {}): pino.Logger => {
  if (loggers.has(name)) {
    return loggers.get(name)
  }

  const logger = pino({
    name,
    base,
    level: levels.get(name) ?? 'info',
    transport: {
      target: 'pino-pretty'
    }
  })

  loggers.set(name, logger)

  return logger
}

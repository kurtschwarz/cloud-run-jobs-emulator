import fs from 'fs'
import YAML from 'yaml'
import yargsParser from 'yargs-parser'
import { getLogger } from './logger'

let config: Config

export class Config {
  host: string = process.env?.HOST ?? '0.0.0.0'
  port: number = parseInt(process.env?.PORT ?? '8123')

  jobs: {
    [name: string]: {
      image: string
    }
  } = {}

  constructor () {
    const logger = getLogger()
    const argv = yargsParser(process.argv?.slice(2))

    if (argv?.config) {
      logger.info({ path: argv.config }, `loading config from ${argv.config}`)

      try {
        if (!fs.existsSync(argv.config)) {
          throw new Error(`invalid config provided, ${argv.config} does not exist`)
        }

        Object.assign(this, YAML.parse(fs.readFileSync(argv.config, 'utf8')) ?? {})
      } catch (err) {
        logger.error({ err }, 'failed to load jobs config')
      }
    }
  }
}

export const getConfig = (): Config => {
  if (!config) {
    config = new Config()
  }

  return config
}

import winston from 'winston'
import { config } from '../config'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    //
    // The simple format outputs
    // `${level}: ${message} ${[Object with everything else]}`
    //
    winston.format.printf(
      (info) => `${info.timestamp} | ${info.level} | ${info.message}`,
    ),
  ),
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    //
    new winston.transports.File({
      filename: 'error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'combined.log',
    }),
  ],
})
//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (config.nodeEnv !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.printf(
        (info) => `${info.timestamp} | ${info.level} | ${info.message}`,
      ),
    }),
  )
}

export default logger

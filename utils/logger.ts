import { LeveledLogMethod, createLogger, format, transports } from 'winston'
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 15)

const loggerFormatter = format((info) => {
  const { level, userId, timestamp, message, ...rest } = info
  const log: any = {
    level: level.toUpperCase(),
    message,
    timestamp,
    traceId: nanoid(),
    [Symbol.for('level')]: level, // required for winston to print logs
    context: rest,
  }

  if (info.userId) {
    log.userId = userId
  }

  return log
})

export const logger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), loggerFormatter(), format.json()),
  transports: [new transports.Console()],
})

const logGeneric = (loggerFn: LeveledLogMethod, msg: string) => {
  const { message, ...rest } = JSON.parse(msg)
  loggerFn(message || 'Api Request', rest)
}

export const logInfo = {
  write(msg: string) {
    logGeneric(logger.info, msg)
  },
}

export const logWarn = {
  write(msg: string) {
    logGeneric(logger.warn, msg)
  },
}

export const logError = {
  write(msg: string) {
    logGeneric(logger.error, msg)
  },
}

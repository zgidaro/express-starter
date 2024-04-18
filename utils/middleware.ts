import { Express, Request, Response } from 'express'
import { InputValidationError } from 'express-zod-api'
import { HttpError } from 'http-errors'
import morgan from 'morgan'
import { logError, logInfo, logWarn } from '@utils/logger'

export const catchErrors = (error: Error, _req: Request, res: Response) => {
  let status = (error as HttpError).status ?? 500
  let message = error.message

  if (error instanceof InputValidationError) {
    status = 400
  }

  res.status(status).send({ message })
}

const formatMorganOutput = (
  tokens: morgan.TokenIndexer<Request, Response>,
  req: Request,
  res: Response,
) =>
  JSON.stringify({
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: tokens.status(req, res),
    responseTime: `${tokens['response-time'](req, res)} ms`,
    userAgent: tokens['user-agent'](req, res),
    httpVersion: tokens['http-version'](req, res),
    contentLength: tokens.res(req, res, 'content-length'),
    date: tokens.date(req, res, 'iso'),
    responseSize: tokens.res(req, res, 'content-length'),
    userId: (req as any).user?.id,
  })

export const setupLogging = (app: Express) => {
  app.use(
    morgan(formatMorganOutput, {
      stream: logInfo,
      skip: (_, res) => res.statusCode >= 400,
    }),
  )
  app.use(
    morgan(formatMorganOutput, {
      stream: logWarn,
      skip: (_, res) => res.statusCode < 400 || res.statusCode === 500,
    }),
  )
  app.use(
    morgan(formatMorganOutput, {
      stream: logError,
      skip: (_, res) => res.statusCode < 500,
    }),
  )
}

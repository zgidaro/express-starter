import { Request, Response } from 'express'
import {
  EndpointsFactory,
  IOSchema,
  createMiddleware,
  createResultHandler,
} from 'express-zod-api'
import { ZodArray, ZodTypeAny, z } from 'zod'
import { catchErrors } from '@utils/middleware'
import jwt from 'jsonwebtoken'
import createHttpError from 'http-errors'
import { config } from '@/config'
import { AuthenticatedUser } from '@/types'

const determineAndSetResponseCode = ({
  request,
  response,
  outputExists,
}: {
  request: Request
  response: Response
  outputExists: boolean
}) => {
  let responseCode: number

  switch (request.method) {
    case 'GET':
      responseCode = 200
      break
    case 'POST':
      responseCode = 201
      break
    case 'PUT':
    case 'PATCH':
      responseCode = outputExists ? 200 : 204
      break
    case 'DELETE':
      responseCode = 204
      break
    default:
      responseCode = 200
      break
  }

  response.status(responseCode)
}

const formatAndSendResponse = ({
  response,
  output,
}: {
  response: Response
  output: any
}) => {
  response.send(output)
}

const resultHandler = createResultHandler({
  getPositiveResponse: (output: IOSchema | ZodArray<ZodTypeAny>) => ({
    schema: z.object({ data: output }),
    mimeType: 'application/json',
  }),
  getNegativeResponse: () => z.object({ error: z.string() }),
  handler({ error, request, response, logger, output }) {
    if (error) {
      catchErrors(error, request, response)
      logger.error(error?.stack || 'Error')
    } else {
      determineAndSetResponseCode({
        request,
        response,
        outputExists: !!output && !!Object.keys(output).length,
      })
      formatAndSendResponse({ response, output })
    }
  },
})

const requireLoginHandler = (request: Request) => {
  try {
    if (request.cookies?.jwt) {
      const jwtData = JSON.parse(request.cookies.jwt)
      const user = jwt.verify(jwtData, config.jwt.secret) as AuthenticatedUser
      return { user }
    }
    throw new createHttpError.Unauthorized('Not logged in')
  } catch (error: any) {
    throw new createHttpError.Unauthorized(error)
  }
}

const allowLoginHandler = (request: Request) => {
  try {
    if (request.cookies?.jwt) {
      const jwtData = JSON.parse(request.cookies.jwt)
      const user = jwt.verify(jwtData, config.jwt.secret) as AuthenticatedUser
      return { user }
    }
  } catch (error: any) {
    console.warn(error)
  }
  return {}
}

export const requireLoginMiddleware = createMiddleware({
  security: {
    type: 'bearer',
  },
  input: z.object({}),
  async middleware({ request }) {
    return requireLoginHandler(request)
  },
})

export const allowLoginMiddleware = createMiddleware({
  input: z.object({}),
  async middleware({ request }) {
    return allowLoginHandler(request)
  },
})

export const requestProviderMiddleware = createMiddleware({
  input: z.object({}),
  middleware: async ({ request }) => ({ request }),
})

export const responseProviderMiddleware = createMiddleware({
  input: z.object({}),
  middleware: async ({ response }) => ({ response }),
})

export const blockFromProd = createMiddleware({
  input: z.object({}),
  async middleware() {
    if (config.nodeEnv === 'production') {
      throw new createHttpError.Unauthorized()
    }

    return { allowed: true }
  },
})

export const endpointsFactory = new EndpointsFactory(resultHandler)

import jwt from 'jsonwebtoken'
import { getCookieOptions } from '@utils/getCookieOptions'
import {
  endpointsFactory,
  requireLoginMiddleware,
  responseProviderMiddleware,
} from '@utils/zod-api-helpers'
import { z } from 'zod'
import { AuthenticatedUser, IUser } from '@/types'
import { createUser, getAuthenticatedUser } from '@services/user'
import { config } from '@/config'

function createToken(user: IUser) {
  const payload = {
    id: user.id,
    email: user.email,
    firstname: user.firstname,
    lastname: user.lastname,
  }
  return jwt.sign(payload, config.jwt.secret)
}

export const signupHandler = endpointsFactory
  .addMiddleware(responseProviderMiddleware)
  .build({
    method: 'post',
    input: z.object({
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().email(),
      password: z.string(),
    }),
    output: AuthenticatedUser,
    async handler({ input, options: { response } }) {
      const user = await createUser(input)

      const token = createToken(user)
      response.cookie('jwt', JSON.stringify(token), getCookieOptions())

      return {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstname!,
        lastName: user.lastname!,
      }
    },
  })

export const loginHandler = endpointsFactory
  .addMiddleware(responseProviderMiddleware)
  .build({
    method: 'post',
    input: z.object({
      email: z.string().email(),
      password: z.string(),
    }),
    output: AuthenticatedUser,
    async handler({ input: { email, password }, options: { response } }) {
      const user = await getAuthenticatedUser(email, password)
      const token = createToken(user)
      response.cookie('jwt', JSON.stringify(token), getCookieOptions())

      return {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstname!,
        lastName: user.lastname!,
      }
    },
  })

export const validateHandler = endpointsFactory
  .addMiddleware(requireLoginMiddleware)
  .build({
    method: 'post',
    input: z.object({}),
    output: AuthenticatedUser,
    async handler({ options: { user } }) {
      return user
    },
  })

export const logoutHandler = endpointsFactory
  .addMiddleware(requireLoginMiddleware)
  .addMiddleware(responseProviderMiddleware)
  .build({
    method: 'delete',
    input: z.object({}),
    output: z.object({}),
    async handler({ options: { response } }) {
      const expiredDate = new Date()
      expiredDate.setDate(expiredDate.getDate() - 1)
      response.clearCookie('jwt', getCookieOptions(expiredDate))
      return {}
    },
  })

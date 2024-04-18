import { logger } from '@utils/logger'
import User from '../models/user'
import bcrypt from 'bcryptjs'
import { config } from '@/config'
import createHttpError from 'http-errors'
import { createCustomer } from '@services/external/stripe'

export const createUser = async ({
  email,
  firstName,
  lastName,
  password,
}: {
  email: string
  firstName: string
  lastName: string
  password: string
}) => {
  const regex = new RegExp('^' + email.toLowerCase(), 'i')
  const loginuser = await User.findOne({
    email: { $regex: regex },
    deletion: { $eq: undefined },
  })
    .select('_id email customerid')
    .exec()

  if (loginuser) {
    const error = `Email already exists.`
    logger.error(error)
    throw new createHttpError.Forbidden(error)
  }

  const user = new User()
  user.email = email
  user.firstname = firstName
  user.lastname = lastName

  const encryptedpassword = await bcrypt.hash(password, config.jwt.saltRounds)
  if (encryptedpassword) {
    user.password = encryptedpassword
  }

  user.customerid = await createCustomer(`${firstName} ${lastName}`, email)

  const savedUser = await user.save()
  if (!savedUser) {
    const error = `Could not create user.`
    logger.error(error)
    throw new createHttpError.InternalServerError(error)
  }

  return user
}

export const getAuthenticatedUser = async (email: string, password: string) => {
  const regex = new RegExp('^' + email.toLowerCase(), 'i')

  const user = await User.findOne({
    email: { $regex: regex },
    deletion: { $eq: undefined },
  }).exec()

  if (!user) {
    const error = 'Please check email'
    logger.error(error)
    throw new createHttpError.Unauthorized(error)
  }

  const match = await bcrypt.compare(password, user.password)
  if (!match) {
    const error = 'Please check password'
    logger.error(error)
    throw new createHttpError.Unauthorized(error)
  }

  return user
}

import { Request, Router } from 'express'
import Stripe from 'stripe'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

import User from '../../models/user'
import info from '../../security/info'
import logger from '../../security/logger'
import { requireLogin } from '../../security/requireLogin'
import { IUser } from '../../types'
import { getCookieOptions } from '../../utils/getCookieOptions'
import { config } from '../../config'

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: config.stripe.apiVersion,
  typescript: true,
})

const router = Router()

function createToken(user: IUser) {
  const payload = {
    id: user.id,
    email: user.email,
    firstname: user.firstname,
    lastname: user.lastname,
  }
  return jwt.sign(payload, info.secret)
}

router.post('/signup', async function (req, res) {
  try {
    const regex = new RegExp('^' + req.body.email.toLowerCase(), 'i')
    const loginuser = await User.findOne({
      email: { $regex: regex },
      deletion: { $eq: undefined },
    })
      .select('_id email customerid')
      .exec()

    if (loginuser) {
      const error = `Email already exists.`
      logger.error(error)
      res.statusCode = 400
      res.json({
        statuscode: res.statusCode,
        api: req.originalUrl,
        error: error,
      })
      return
    }

    const user = new User()
    user.email = req.body.email
    user.firstname = req.body.firstname
    user.lastname = req.body.lastname

    const password = req.body.password
    const encryptedpassword = await bcrypt.hash(password, info.saltRounds)
    if (encryptedpassword) {
      user.password = encryptedpassword
    }

    const customer = await stripe.customers.create({
      name: `${req.body.firstname} ${req.body.lastname}`,
      email: req.body.email,
    })
    user.customerid = customer.id

    const savedUser = await user.save()
    if (!savedUser) {
      const error = `Could not create user.`
      logger.error(error)
      res.statusCode = 400
      res.json({
        statuscode: res.statusCode,
        api: req.originalUrl,
        error: error,
      })
      return
    }

    const token = createToken(user)
    res.cookie('jwt', JSON.stringify(token), getCookieOptions())

    res.statusCode = 200
    res.json({
      id: user._id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
    })
  } catch (error) {
    logger.error(error)
  }
})

router.post('/login', async function (req, res) {
  try {
    const regex = new RegExp('^' + req.body.email.toLowerCase(), 'i')

    const user = await User.findOne({
      email: { $regex: regex },
      deletion: { $eq: undefined },
    }).exec()

    if (!user) {
      const error = 'Please check email'
      logger.error(error)
      res.statusCode = 404
      res.json({ message: error })
      return
    }

    const match = await bcrypt.compare(req.body.password, user.password)
    if (!match) {
      const error = 'Please check password'
      logger.error(error)
      res.statusCode = 400
      res.json({ message: error })
      return
    }

    const token = createToken(user)
    res.cookie('jwt', JSON.stringify(token), getCookieOptions())

    res.statusCode = 200
    res.json({
      id: user._id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
    })
  } catch (error) {
    logger.error(error)
    res.statusCode = 500
    res.json({
      message: 'INTERNAL SERVER ERROR. User Login: ' + error,
    })
  }
})

router.put('/', requireLogin, async function (req: Request, res) {
  if (!req.user) {
    res.status(401).json()
    return
  }

  let updateStripeCustomer = false
  let updatedUser = {} as Partial<IUser>
  if (req.body.firstname) {
    updatedUser.firstname = req.body.firstname
    updateStripeCustomer = true
  }
  if (req.body.lastname) {
    updatedUser.lastname = req.body.lastname
    updateStripeCustomer = true
  }
  if (req.body.password) {
    const encryptedpassword = await bcrypt.hash(
      req.body.password,
      info.saltRounds,
    )
    if (encryptedpassword) {
      updatedUser.password = encryptedpassword
    }
  }

  const user = await User.findOneAndUpdate(
    { _id: req.user.id, deletion: { $eq: undefined } },
    updatedUser,
    { new: true },
  )

  if (!user) {
    res.status(404).json({ message: 'User not found' })
    return
  }

  if (updateStripeCustomer) {
    await stripe.customers.update(user.customerid, {
      name: `${user.firstname} ${user.lastname}`,
    })
  }

  const token = createToken(user)
  res.cookie('jwt', JSON.stringify(token), getCookieOptions())

  res.status(204).json({
    id: user._id,
    email: user.email,
    firstname: user.firstname,
    lastname: user.lastname,
  })
})

router.post('/validate', requireLogin, async function (req: Request, res) {
  const user = req.user
  if (!user) {
    return res.status(401).json({})
  }

  res.status(200).json(user)
})

router.post('/logout', requireLogin, async function (req, res, next) {
  try {
    const expiredDate = new Date()
    expiredDate.setDate(expiredDate.getDate() - 1)
    res.clearCookie('jwt', getCookieOptions(expiredDate))
    res.status(204).json()
  } catch (error) {
    next(error)
  }
})

export default router

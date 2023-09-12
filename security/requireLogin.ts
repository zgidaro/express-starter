import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import info from './info'

// declare module "express-serve-static-core" {
declare module 'express' {
  interface Request {
    user?: {
      id: string
      email: string
      firstname: string
      lastname: string
    }
  }
}

export const requireLogin = async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (req.cookies?.jwt) {
      const jwtData = JSON.parse(req.cookies.jwt)
      req.user = (await jwt.verify(jwtData, info.secret)) as {
        id: string
        email: string
        firstname: string
        lastname: string
      }
      next()
      return
    }
    return res.status(403).send({ error: 'not logged in' })
  } catch (error) {
    return res.status(403).send({ message: error })
  }
}

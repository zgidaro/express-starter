import { CookieOptions } from 'express'
import { config } from '../config'

export function getCookieOptions(expiry?: Date): CookieOptions {
  const tokenExpiryDate = new Date()
  tokenExpiryDate.setDate(tokenExpiryDate.getDate() + 7)
  return {
    httpOnly: true,
    sameSite: 'none',
    path: '/',
    secure: config.nodeEnv === 'production', // false for safari dev
    expires: expiry ?? tokenExpiryDate,
    domain: config.domain,
  }
}

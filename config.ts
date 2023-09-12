import dotenv from 'dotenv'

dotenv.config()

const { DOMAIN, MONGODB, NODE_ENV, ORIGIN, PORT, STRIPE_SECRET_KEY } =
  process.env

export const config = {
  domain: DOMAIN || 'localhost',
  mongodb: MONGODB || 'mongodb://localhost:27017/development',
  nodeEnv: NODE_ENV || 'development',
  origin: ORIGIN || 'http://localhost:3001',
  port: PORT || 3000,
  price: {},
  stripe: {
    apiVersion: '2022-11-15' as const,
    secretKey: STRIPE_SECRET_KEY || '',
  },
}

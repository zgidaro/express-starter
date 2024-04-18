import dotenv from 'dotenv'

dotenv.config()

const {
  AWS_ACCESS_KEY,
  AWS_ACCESS_KEY_SECRET,
  AWS_S3_BUCKET,
  AWS_S3_REGION,
  DOMAIN,
  JWT_SALT_ROUNDS,
  JWT_SECRET,
  MONGODB,
  NODE_ENV,
  ORIGIN,
  PORT,
  STRIPE_SECRET_KEY,
} = process.env

export const config = {
  aws: {
    accessKey: AWS_ACCESS_KEY || '',
    secretAccessKey: AWS_ACCESS_KEY_SECRET || '',
    s3: {
      bucket: AWS_S3_BUCKET || '',
      region: AWS_S3_REGION || 'us-east-1',
      contentUrl: 'https://s3.amazonaws.com',
    },
  },
  domain: DOMAIN || 'localhost',
  jwt: {
    saltRounds: parseInt(JWT_SALT_ROUNDS || '1', 10),
    secret: JWT_SECRET || '',
  },
  mongodb: MONGODB || 'mongodb://localhost:27017/development',
  nodeEnv: NODE_ENV || 'development',
  origin: ORIGIN || 'http://localhost:3001',
  port: PORT || 3000,
  price: {},
  stripe: {
    apiVersion: '2023-10-16' as const,
    secretKey: STRIPE_SECRET_KEY || '',
  },
}

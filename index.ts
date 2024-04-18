import express from 'express'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import http from 'http'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { config } from '@/config'
import { setupLogging } from '@/utils/middleware'
import { attachRouting, createConfig } from 'express-zod-api'
import { logger } from '@utils/logger'
import { zodRouting } from '@api/routing'

const app = express()
const server = http.createServer(app)

/**
 * setup database
 */
mongoose
  .connect(config.mongodb)
  .then(() => {
    console.log('      DB Connection successful      ')
    console.log('************************************')
  })
  .catch((error) => {
    console.error('DB Connection failed', error)
  })

app.use(bodyParser.json({ limit: '200mb' }))
app.use(
  bodyParser.urlencoded({
    parameterLimit: 100000,
    limit: '200mb',
    extended: true,
  }),
)
app.use(cookieParser())
app.use(
  cors({
    credentials: true,
    origin: config.origin,
  }),
)

// allow cross domain
app.use((req, res, next) => {
  if ('OPTIONS' == req.method) {
    // res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
    res.header(
      'Access-Control-Allow-Methods',
      'GET,PUT,POST,DELETE,PATCH,OPTIONS',
    )
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, Content-Length, X-Requested-With',
    )
    res.send(200)
  } else {
    next()
  }
})

setupLogging(app)

const zodConfig = createConfig({
  app: app,
  inputSources: {
    get: ['params', 'query'],
    post: ['params', 'body', 'files'],
    put: ['params', 'body', 'files'],
    patch: ['params', 'body'],
    delete: ['params', 'body', 'query'],
  },
  logger,
  cors: false,
  startupLogo: false,
})
attachRouting(zodConfig, zodRouting)

/**
 * setup server
 */
server.listen(config.port, () => {
  console.log(`    Server started on port ${config.port}`)
})

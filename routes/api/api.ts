import { Router, Request, Response } from 'express'

const router = Router()

router.get('/', (_: Request, res: Response) => {
  res.send('Api Version 1.0')
})

export default router

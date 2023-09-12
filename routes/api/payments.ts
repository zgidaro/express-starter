import { Request, Router } from 'express'
import { requireLogin } from '../../security/requireLogin'
import { getSetupIntentOrAssignDefaultPayment } from '../../services/payments'

const router = Router()

router.get('/setup-intent', requireLogin, async function (req: Request, res) {
  if (!req.user) {
    res.status(401).json()
    return
  }
  getSetupIntentOrAssignDefaultPayment(req.user.id)
    .then((result) => res.status(200).json(result))
    .catch((error) => {
      console.error(error)
      res.status(500).json({ error: 'error setting up payment intent' })
    })
})

export default router

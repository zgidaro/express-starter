import Stripe from 'stripe'
import { config } from '@/config'

let stripe: Stripe

const getStripe = (): Stripe => {
  if (!stripe) {
    stripe = new Stripe(config.stripe.secretKey, {
      apiVersion: config.stripe.apiVersion,
      typescript: true,
    })
  }

  return stripe
}

export const createCustomer = async (
  name: string,
  email: string,
): Promise<string> => {
  const customer = await getStripe().customers.create({ name, email })
  return customer.id
}

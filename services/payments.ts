import { config } from '../config'
import Subscription from '../models/subscription'

import Stripe from 'stripe'

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: config.stripe.apiVersion,
  typescript: true,
})

export const getUpcomingInvoice = async function (organizationId: string) {
  const subscriptions = await Subscription.find({
    organization: organizationId,
  })
  if (!subscriptions.length) {
    return 0
  }
  let totalCost = 0
  for (const subscription of subscriptions) {
    const invoice = await stripe.invoices.retrieveUpcoming({
      subscription: subscription.subscriptionid as string,
    })
    if (invoice) {
      totalCost += invoice.total
    }
  }
  return totalCost / 100
}

export const getSetupIntentOrAssignDefaultPayment = async function (
  userId: string,
) {
  const user = { id: '', customerid: '' }
  if (!user) {
    return { clientSecret: null }
  }
  const customer = await stripe.customers.retrieve(user.customerid)
  const paymentMethods = await stripe.customers.listPaymentMethods(
    user.customerid,
    { type: 'card' },
  )
  if (paymentMethods.data.length) {
    if (
      !customer.deleted &&
      !customer.invoice_settings.default_payment_method
    ) {
      // update default payment method
      await stripe.customers.update(user.customerid, {
        invoice_settings: { default_payment_method: paymentMethods.data[0].id },
      })
    }
    return { clientSecret: null }
  } else if (user.id !== userId) {
    return { clientSecret: null, notAdmin: true }
  } else {
    const setupIntent = await stripe.setupIntents.create({
      customer: user.customerid,
      payment_method_types: ['card'],
    })
    return { clientSecret: setupIntent.client_secret }
  }
}

export const updateSubscriptionWithQuantity = async function (
  userId: string,
  customerId: string,
  organizationId: string,
  priceId: string,
  quantity: number,
) {
  // get subscriptions, if none, create a new one, if exists for organization, update
  const subscription = await Subscription.findOne({
    creationuser: userId,
    organization: organizationId,
  })
  if (!subscription) {
    // create subscription
    const newSubscription = await stripe.subscriptions.create({
      customer: customerId,
      currency: 'cad',
      items: [{ price: priceId, quantity }],
      collection_method: 'charge_automatically',
    })
    await new Subscription({
      organization: organizationId,
      subscriptionid: newSubscription.id,
      creationuser: userId,
    }).save()
  } else {
    // update subscription
    const existingSubscription = await stripe.subscriptions.retrieve(
      subscription.subscriptionid as string,
    )
    const itemToUpdate = existingSubscription.items.data.find(
      (s) => s.price.id === priceId,
    )
    if (itemToUpdate) {
      await stripe.subscriptionItems.update(itemToUpdate.id, {
        quantity,
        proration_behavior: 'always_invoice', // charge customer immediately
      })
    } else {
      // add member subscription item to subscription
      await stripe.subscriptions.update(subscription.subscriptionid as string, {
        items: [{ price: priceId, quantity }],
        proration_behavior: 'always_invoice', // charge customer immediately
      })
    }
  }
}

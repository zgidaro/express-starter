import { Schema, model } from 'mongoose'
import { ISubscription } from '../types'

const schema = new Schema<ISubscription>({
  subscriptionid: { type: String, required: true, index: true },
  creationuser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  creation: { type: Date, default: Date.now },
  modified: { type: Date, default: Date.now },
  deletion: { type: Date },
})

export default model<ISubscription>('Subscription', schema)

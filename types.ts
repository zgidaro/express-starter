import { Document, Types } from 'mongoose'
import { z } from 'zod'

export const AuthenticatedUser = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
})
export type AuthenticatedUser = z.infer<typeof AuthenticatedUser>

export interface IUser extends Document {
  email: string
  password: string
  firstname?: string
  lastname?: string
  customerid: string
  creation: Date
  modified: Date
  deletion?: Date
}

interface ITimestamp {
  creation: Date
  modified: Date
  deletion?: Date
}

interface ITimestampWithUser extends ITimestamp {
  creationuser: Types.ObjectId
  modifieduser: Types.ObjectId
  deletionuser?: Types.ObjectId
}

export interface ISubscription
  extends Document,
    Omit<ITimestampWithUser, 'modifieduser' | 'deletionuser'> {
  subscriptionid: string
}

import { Schema, model } from 'mongoose'
import { IUser } from '../types'

const schema = new Schema<IUser>({
  email: { type: String, required: true, trim: true, index: true },
  password: { type: String, required: true },
  firstname: { type: String },
  lastname: { type: String },
  customerid: { type: String, required: true },
  creation: { type: Date, default: Date.now, index: true },
  modified: { type: Date, default: Date.now },
  deletion: { type: Date },
})

export default model<IUser>('User', schema)

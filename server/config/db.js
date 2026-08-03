import mongoose from 'mongoose'

export async function connectDb() {
  mongoose.set('strictQuery', true)
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('MongoDB connected')
}

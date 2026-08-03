import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export default async function auth(req, res, next) {
  const token = req.cookies.token
  if (!token) {
    return res.status(401).json({ message: 'Not signed in' })
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findOne({ _id: payload.userId, tokenVersion: payload.tv ?? 0 }).select(
      '_id'
    )
    if (!user) {
      return res.status(401).json({ message: 'Session expired — sign in again' })
    }
    req.userId = payload.userId
    next()
  } catch {
    return res.status(401).json({ message: 'Session expired — sign in again' })
  }
}

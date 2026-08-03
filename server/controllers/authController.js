import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { signPurposeToken, verifyPurposeToken, signSessionToken } from '../utils/tokens.js'
import { sendResetEmail, sendVerificationEmail } from '../services/mailer.js'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

const clientUrl = () => process.env.CLIENT_URL || 'http://localhost:5173'

function signAndSetCookie(res, user) {
  const token = signSessionToken(user._id, user.tokenVersion)
  res.cookie('token', token, COOKIE_OPTIONS)
}

export async function register(req, res, next) {
  try {
    const { username, email, password } = req.body
    const normalizedEmail = email.toLowerCase()
    const existing = await User.findOne({ $or: [{ email: normalizedEmail }, { username }] })
    if (existing) {
      const conflict =
        existing.email === normalizedEmail
          ? 'An account with that email already exists'
          : 'That username is taken'
      return res.status(409).json({ message: conflict })
    }
    const passwordHash = await bcrypt.hash(password, 12)
    const user = await User.create({ username, email: normalizedEmail, passwordHash })
    signAndSetCookie(res, user)
    const token = signPurposeToken(user._id, 'verify', '24h')
    sendVerificationEmail(user.email, `${clientUrl()}/verify?token=${token}`)
    res.status(201).json({ user: user.toPublic() })
  } catch (err) {
    next(err)
  }
}

export async function login(req, res, next) {
  try {
    const { identifier, password } = req.body
    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
    })
    if (!user) {
      return res.status(401).json({ message: 'No account matches that email or username' })
    }
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) {
      return res.status(401).json({ message: 'Incorrect password' })
    }
    signAndSetCookie(res, user)
    res.json({ user: user.toPublic() })
  } catch (err) {
    next(err)
  }
}

export async function logout(req, res) {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  })
  res.json({ message: 'Signed out' })
}

export async function me(req, res, next) {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      })
      return res.status(401).json({ message: 'Session expired — sign in again' })
    }
    res.json({ user: user.toPublic() })
  } catch (err) {
    next(err)
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body
    const user = await User.findOne({ email: email.toLowerCase() })
    if (user) {
      const token = signPurposeToken(user._id, 'reset', '1h')
      await sendResetEmail(user.email, `${clientUrl()}/reset?token=${token}`)
    }
    res.json({ message: 'If that account exists, a reset link is on its way.' })
  } catch (err) {
    next(err)
  }
}

export async function resetPassword(req, res, _next) {
  try {
    const { token, newPassword } = req.body
    const userId = verifyPurposeToken(token, 'reset')
    const user = await User.findById(userId)
    if (!user) return res.status(400).json({ message: 'That link is no longer valid' })
    user.passwordHash = await bcrypt.hash(newPassword, 12)
    user.tokenVersion = (user.tokenVersion || 0) + 1
    await user.save()
    res.json({ message: 'Password updated — sign in with your new password' })
  } catch {
    return res.status(400).json({ message: 'That link is invalid or has expired' })
  }
}

export async function verifyEmail(req, res, _next) {
  try {
    const { token } = req.body
    const userId = verifyPurposeToken(token, 'verify')
    const user = await User.findById(userId)
    if (!user) return res.status(400).json({ message: 'That link is no longer valid' })
    if (!user.emailVerified) {
      user.emailVerified = true
      await user.save()
    }
    res.json({ user: user.toPublic() })
  } catch {
    return res.status(400).json({ message: 'That link is invalid or has expired' })
  }
}

export async function resendVerification(req, res, next) {
  try {
    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ message: 'Account not found' })
    if (user.emailVerified) return res.json({ message: 'Email already verified' })
    const token = signPurposeToken(user._id, 'verify', '24h')
    await sendVerificationEmail(user.email, `${clientUrl()}/verify?token=${token}`)
    res.json({ message: 'Verification email sent' })
  } catch (err) {
    next(err)
  }
}

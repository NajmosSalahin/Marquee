import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, MailCheck } from 'lucide-react'
import { forgotPassword } from '../api/auth.js'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.friendlyMessage)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-10 block text-center">
          <span className="font-display text-4xl font-semibold tracking-tight text-ink">
            Marquee<span className="text-accent">.</span>
          </span>
        </Link>
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
          {sent ? (
            <div className="space-y-3 text-center">
              <MailCheck className="mx-auto h-8 w-8 text-accent" aria-hidden="true" />
              <p className="font-semibold text-ink">Check your inbox</p>
              <p className="text-sm text-muted">
                If an account exists for that email, a reset link is on its way. It expires in one
                hour.
              </p>
              <Link to="/login" className="btn btn-accent mt-2 w-full">
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <h1 className="font-display text-xl font-semibold text-ink">Forgot your password?</h1>
              <p className="text-sm text-muted">Enter your email and we'll send a reset link.</p>
              <div>
                <label className="label" htmlFor="fp-email">
                  Email
                </label>
                <input
                  id="fp-email"
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  autoFocus
                />
              </div>
              {error && <p className="text-sm text-red-300">{error}</p>}
              <button type="submit" className="btn btn-accent w-full" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                Send reset link
              </button>
              <p className="text-center text-sm text-muted">
                <Link to="/login" className="font-semibold text-accent hover:underline">
                  Back to sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

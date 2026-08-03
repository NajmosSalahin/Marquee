import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../context/useAuth.js'

export default function LoginPage() {
  const { login } = useAuth()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await login(identifier, password)
    } catch (err) {
      toast.error(err.friendlyMessage)
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
        <form
          onSubmit={submit}
          className="space-y-4 rounded-2xl border border-line bg-surface p-6 shadow-card"
        >
          <div>
            <label className="label" htmlFor="identifier">
              Email or username
            </label>
            <input
              id="identifier"
              className="input"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <button type="submit" className="btn btn-accent w-full" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Sign in
          </button>
          <div className="flex items-center justify-between text-sm text-muted">
            <Link to="/forgot" className="font-medium hover:text-ink">
              Forgot password?
            </Link>
            <span>
              New here?{' '}
              <Link to="/register" className="font-semibold text-accent hover:underline">
                Create an account
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}

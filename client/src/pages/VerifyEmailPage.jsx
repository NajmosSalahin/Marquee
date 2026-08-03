import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { BadgeCheck, Loader2 } from 'lucide-react'
import { verifyEmail } from '../api/auth.js'
import { useAuth } from '../context/useAuth.js'

export default function VerifyEmailPage() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const { user, updateUser } = useAuth()
  const userIdRef = useRef(user?.id)
  userIdRef.current = user?.id
  const [state, setState] = useState('pending')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setState('error')
      setError('This verification link is incomplete — no token was found.')
      return
    }
    verifyEmail(token)
      .then(({ user: verified }) => {
        setState('verified')
        if (!userIdRef.current || userIdRef.current === verified.id) updateUser(verified)
        toast.success('Email verified')
      })
      .catch((err) => {
        setState('error')
        setError(err.friendlyMessage)
      })
  }, [token, updateUser])

  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-10 block text-center">
          <span className="font-display text-4xl font-semibold tracking-tight text-ink">
            Marquee<span className="text-accent">.</span>
          </span>
        </Link>
        <div className="space-y-3 rounded-2xl border border-line bg-surface p-6 text-center shadow-card">
          {state === 'pending' && (
            <>
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-accent" aria-hidden="true" />
              <p className="text-sm text-muted">Verifying your email…</p>
            </>
          )}
          {state === 'verified' && (
            <>
              <BadgeCheck className="mx-auto h-8 w-8 text-accent" aria-hidden="true" />
              <p className="font-semibold text-ink">Email verified</p>
              <p className="text-sm text-muted">Your account is confirmed.</p>
              <Link to="/" className="btn btn-accent mt-2 w-full">
                Go to your watchlist
              </Link>
            </>
          )}
          {state === 'error' && (
            <>
              <p className="font-semibold text-ink">Couldn't verify that link</p>
              <p className="text-sm text-muted">{error}</p>
              <Link to="/settings" className="btn btn-ghost mt-2 w-full">
                Resend from Settings
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

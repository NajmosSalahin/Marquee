import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, LogOut, MailWarning, Settings } from 'lucide-react'
import { useAuth } from '../../context/useAuth.js'
import { resendVerification } from '../../api/auth.js'

export default function ProfileMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  const resend = useMutation({
    mutationFn: resendVerification,
    onSuccess: (data) => toast.success(data.message || 'Verification email sent'),
    onError: (err) => toast.error(err.friendlyMessage),
  })

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (!user) return null

  const signOut = async () => {
    await logout()
    navigate('/login')
  }

  const row = 'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-ink hover:bg-surface2'

  return (
    <div className="relative hidden md:block" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface2 text-sm font-bold text-accent ring-1 ring-line">
          {user.username?.[0]?.toUpperCase()}
        </span>
        <span className="text-sm font-medium text-ink">{user.username}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-line bg-surface p-1.5 shadow-card"
        >
          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface2 text-sm font-bold text-accent ring-1 ring-line">
              {user.username?.[0]?.toUpperCase()}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-ink">{user.username}</span>
              <span className="block truncate text-xs text-muted" title={user.email}>
                {user.email}
              </span>
            </span>
          </div>

          <div className="my-1 border-t border-line" />

          {!user.emailVerified && (
            <button
              role="menuitem"
              className={row}
              onClick={() => resend.mutate()}
              disabled={resend.isPending}
            >
              {resend.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <MailWarning className="h-4 w-4" aria-hidden="true" />
              )}
              {resend.isPending ? 'Sending…' : 'Verify email'}
            </button>
          )}

          <Link
            role="menuitem"
            to="/settings"
            className={row}
            onClick={() => setOpen(false)}
          >
            <Settings className="h-4 w-4" aria-hidden="true" />
            Settings
          </Link>

          <div className="my-1 border-t border-line" />

          <button role="menuitem" className={row} onClick={signOut}>
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

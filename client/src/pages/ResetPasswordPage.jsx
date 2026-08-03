import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { resetPassword } from '../api/auth.js';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await resetPassword(token, password);
      setDone(true);
      toast.success('Password updated');
    } catch (err) {
      setError(err.friendlyMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-10 block text-center">
          <span className="font-display text-4xl font-semibold tracking-tight text-ink">
            Marquee<span className="text-accent">.</span>
          </span>
        </Link>
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
          {!token ? (
            <p className="text-sm text-muted">
              This reset link is incomplete — it looks like it was opened without a token. Request a fresh one below.
            </p>
          ) : done ? (
            <div className="space-y-3 text-center">
              <p className="font-semibold text-ink">Password updated</p>
              <p className="text-sm text-muted">Sign in with your new password.</p>
              <Link to="/login" className="btn btn-accent mt-2 w-full">
                Sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <h1 className="font-display text-xl font-semibold text-ink">Choose a new password</h1>
              <div>
                <label className="label" htmlFor="rp-password">New password</label>
                <input
                  id="rp-password"
                  type="password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  autoFocus
                />
                <p className="mt-1 text-xs text-muted">At least 8 characters.</p>
              </div>
              {error && <p className="text-sm text-red-300">{error}</p>}
              <button type="submit" className="btn btn-accent w-full" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                Update password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

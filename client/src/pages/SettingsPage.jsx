import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BadgeCheck, MailWarning } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { updatePreferences } from '../api/users.js';
import { resendVerification } from '../api/auth.js';
import { ACCENTS, STATUSES, TYPES } from '../lib/constants.js';
import { formatDate } from '../lib/format.js';

function SettingCard({ title, body, children }) {
  return (
    <section className="rounded-xl border border-line bg-surface p-5">
      <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      {body && <p className="mt-1 text-sm text-muted">{body}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const prefs = user?.preferences || { accentColor: 'amber', defaultView: 'board', density: 'comfortable' };

  const mutation = useMutation({
    mutationFn: updatePreferences,
    onSuccess: (u) => {
      updateUser(u);
      toast.success('Preferences saved');
    },
    onError: (err) => toast.error(err.friendlyMessage),
  });

  const set = (key, value) => mutation.mutate({ [key]: value });

  const resend = useMutation({
    mutationFn: resendVerification,
    onSuccess: (data) => toast.success(data.message || 'Verification email sent'),
    onError: (err) => toast.error(err.friendlyMessage),
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          These follow you across devices — they're saved to your account, not this browser.
        </p>
      </div>

      <SettingCard title="Accent color" body="Buttons, focus rings, and that marquee glow.">
        <div className="flex flex-wrap gap-3">
          {ACCENTS.map((a) => (
            <button
              key={a.id}
              onClick={() => set('accentColor', a.id)}
              aria-pressed={prefs.accentColor === a.id}
              className="group flex flex-col items-center gap-1.5"
              title={a.label}
            >
              <span
                className={`h-9 w-9 rounded-full transition-all ${
                  prefs.accentColor === a.id ? 'ring-2 ring-ink ring-offset-2 ring-offset-surface scale-105' : 'group-hover:scale-105'
                }`}
                style={{ background: a.color }}
              />
              <span className={`text-[11px] font-medium ${prefs.accentColor === a.id ? 'text-ink' : 'text-muted'}`}>
                {a.label}
              </span>
            </button>
          ))}
        </div>
      </SettingCard>

      <SettingCard title="Density" body="How tightly the poster wall packs.">
        <div className="inline-flex overflow-hidden rounded-lg hairline" role="group" aria-label="Density">
          {[
            { id: 'comfortable', label: 'Comfortable' },
            { id: 'compact', label: 'Compact' },
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => set('density', d.id)}
              aria-pressed={prefs.density === d.id}
              className={`px-4 py-2 text-sm font-semibold transition-colors ${
                prefs.density === d.id ? 'bg-accent text-[#14100a]' : 'text-muted hover:bg-surface2 hover:text-ink'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </SettingCard>

      <SettingCard title="Default view" body="Where the watchlist opens each time.">
        <div className="inline-flex overflow-hidden rounded-lg hairline" role="group" aria-label="Default view">
          {[
            { id: 'board', label: 'Board' },
            { id: 'grid', label: 'Grid' },
            { id: 'list', label: 'List' },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => set('defaultView', v.id)}
              aria-pressed={prefs.defaultView === v.id}
              className={`px-4 py-2 text-sm font-semibold transition-colors ${
                prefs.defaultView === v.id ? 'bg-accent text-[#14100a]' : 'text-muted hover:bg-surface2 hover:text-ink'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </SettingCard>

      <SettingCard title="Profile">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Username</dt>
            <dd className="font-semibold text-ink">{user?.username}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Email</dt>
            <dd className="flex items-center gap-2 font-mono text-ink">
              {user?.email}
              {user?.emailVerified ? (
                <span className="chip text-accent">
                  <BadgeCheck className="h-3 w-3" aria-hidden="true" /> Verified
                </span>
              ) : (
                <span className="chip">
                  <MailWarning className="h-3 w-3" aria-hidden="true" /> Unverified
                </span>
              )}
            </dd>
          </div>
          {!user?.emailVerified && (
            <div className="mt-3">
              <button
                onClick={() => resend.mutate()}
                disabled={resend.isPending}
                className="btn btn-ghost w-full py-2 text-sm"
              >
                {resend.isPending ? 'Sending…' : 'Resend verification email'}
              </button>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted">Member since</dt>
            <dd className="font-mono text-ink">{formatDate(user?.createdAt)}</dd>
          </div>
        </dl>
      </SettingCard>

      <p className="text-xs text-muted">
        Statuses: {STATUSES.map((s) => s.label).join(' · ')} — Types: {TYPES.map((t) => t.label).join(' · ')}
      </p>
    </div>
  );
}

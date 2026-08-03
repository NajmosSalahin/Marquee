export default function EmptyState({ icon: Icon, title, body, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line bg-surface/40 px-6 py-16 text-center">
      {Icon && <Icon className="h-8 w-8 text-muted/60" aria-hidden="true" />}
      <p className="text-base font-semibold text-ink">{title}</p>
      {body && <p className="max-w-sm text-sm text-muted">{body}</p>}
      {action}
    </div>
  );
}

export function EmptyAdminPanel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border-strong bg-surface-muted px-5 py-8">
      <h2 className="font-display text-lg font-semibold text-ink-900">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm text-ink-600">{description}</p>
    </div>
  );
}

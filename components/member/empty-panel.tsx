export function EmptyPanel({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border-strong bg-surface-raised px-5 py-8">
      <p className="font-display text-lg font-semibold text-ink-900">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-500">{body}</p>
    </div>
  );
}

export function AdminStatusBanner({
  tone = "info",
  children,
}: {
  tone?: "info" | "error" | "success";
  children: React.ReactNode;
}) {
  const styles =
    tone === "error"
      ? "border-danger-100 bg-danger-50/50 text-danger-700"
      : tone === "success"
        ? "border-border-subtle bg-surface-muted text-ink-800"
        : "border-border-subtle bg-surface-muted text-ink-700";

  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-md border px-4 py-3 text-sm ${styles}`}
    >
      {children}
    </p>
  );
}

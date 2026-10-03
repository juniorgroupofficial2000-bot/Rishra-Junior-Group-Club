import type { AdminRuntimeDiagnostics } from "@/server/ops/runtime-diagnostics";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-ink-500">{label}</dt>
      <dd className="mt-1 font-medium text-ink-900">{value}</dd>
    </div>
  );
}

/**
 * Safe environment / build metadata for admin settings.
 * Never receives secrets — only pre-sanitized diagnostics.
 */
export function EnvironmentInfoPanel({
  info,
}: {
  info: AdminRuntimeDiagnostics;
}) {
  return (
    <section
      aria-labelledby="env-info-heading"
      className="rounded-xl border border-border-subtle bg-surface-raised p-5 shadow-xs"
    >
      <h2
        id="env-info-heading"
        className="font-display text-lg font-semibold text-ink-900"
      >
        Environment
      </h2>
      <p className="mt-1 text-sm text-ink-600">
        {info.isProduction
          ? "Production build details for authorized administrators. Secrets are never shown here."
          : "Non-production diagnostics. Secrets and credentials are never exposed."}
      </p>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        <Row label="Environment" value={info.environment} />
        <Row label="Version" value={info.version} />
        <Row label="Commit" value={info.commit ?? "unavailable"} />
        <Row
          label="Build timestamp"
          value={info.buildTimestamp ?? "unavailable"}
        />
        <Row label="API version" value={info.apiVersion} />
        {!info.isProduction ? (
          <>
            <Row label="Database environment" value={info.databaseEnvironment} />
            <Row label="Payment mode" value={info.paymentMode} />
            <Row label="Payment provider" value={info.paymentProvider} />
            <Row label="Media storage" value={info.mediaStorageDriver} />
          </>
        ) : (
          <Row label="Payment mode" value={info.paymentMode} />
        )}
      </dl>
    </section>
  );
}

import { siteConfig } from "@/content/site";
import { cn } from "@/lib/cn";
import Image from "next/image";

export function DigitalMembershipCard({
  displayName,
  membershipNumber,
  membershipType,
  statusLabel,
  joinedOn,
  validThrough,
  portraitUrl,
  qrDataUrl,
  className,
}: {
  displayName: string;
  membershipNumber: string;
  membershipType: string | null;
  statusLabel: string;
  joinedOn: string | null;
  validThrough: string | null;
  portraitUrl: string | null;
  qrDataUrl?: string | null;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-2xl border border-ink-800/20 bg-gradient-to-br from-ink-950 via-ink-900 to-alta-900 text-white shadow-md",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(196,154,26,0.35), transparent 45%), radial-gradient(circle at 80% 0%, rgba(194,58,34,0.25), transparent 40%)",
        }}
        aria-hidden
      />
      <div className="relative grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:p-6">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-marigold-300">
            {siteConfig.name}
          </p>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight">
            {displayName}
          </h2>
          <dl className="mt-4 space-y-2 text-sm text-ink-100">
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              <dt className="text-ink-300">Membership ID</dt>
              <dd className="font-mono text-marigold-200">{membershipNumber}</dd>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              <dt className="text-ink-300">Type</dt>
              <dd>{membershipType ?? "Membership"}</dd>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              <dt className="text-ink-300">Status</dt>
              <dd>{statusLabel}</dd>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              <dt className="text-ink-300">Member since</dt>
              <dd>{joinedOn ?? "—"}</dd>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              <dt className="text-ink-300">Valid through</dt>
              <dd>{validThrough ?? "Open"}</dd>
            </div>
          </dl>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-white/20 bg-ink-800">
            {portraitUrl ? (
              <Image
                src={portraitUrl}
                alt=""
                fill
                className="object-cover"
                sizes="96px"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-ink-400">
                Photo
              </div>
            )}
          </div>
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt="Membership verification QR code"
              className="h-28 w-28 rounded-md bg-white p-2"
              width={112}
              height={112}
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}

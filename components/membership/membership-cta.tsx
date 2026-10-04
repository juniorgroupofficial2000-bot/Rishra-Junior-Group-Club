import { FadeIn } from "@/components/motion/fade-in";
import {
  membershipApplicationConfig,
  membershipPageCopy,
} from "@/content/membership";
import Link from "next/link";

export function MembershipCta() {
  const { cta } = membershipPageCopy;
  const online = membershipApplicationConfig.onlineApplicationsEnabled;

  return (
    <FadeIn>
      <aside
        aria-labelledby="membership-cta-heading"
        className="relative overflow-hidden rounded-2xl bg-ink-900 px-6 py-10 text-white sm:px-10 sm:py-12"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, rgb(201 67 42 / 0.35), transparent 45%), radial-gradient(circle at 85% 10%, rgb(196 154 26 / 0.22), transparent 40%)",
          }}
        />
        <div className="relative max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-marigold-400">
            Next step
          </p>
          <h2
            id="membership-cta-heading"
            className="mt-3 font-display text-3xl font-semibold tracking-tight"
          >
            {cta.title}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink-200">{cta.body}</p>
          {!online ? (
            <p className="mt-4 text-sm text-ink-300">
              Online membership applications are not enabled yet. Enquiries are
              welcome through official contact channels.
            </p>
          ) : null}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={cta.primaryHref}
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-alta-500 px-5 text-sm font-medium text-white transition-colors hover:bg-alta-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900"
            >
              {cta.primaryLabel}
            </Link>
            <Link
              href={cta.secondaryHref}
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/35 px-5 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900"
            >
              {cta.secondaryLabel}
            </Link>
          </div>
        </div>
      </aside>
    </FadeIn>
  );
}

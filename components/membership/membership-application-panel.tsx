import { membershipApplicationConfig } from "@/content/membership";
import Link from "next/link";

/**
 * Public membership next-step panel.
 * Online applications are not enabled — enquire via Contact only.
 */
export function MembershipApplicationPanel() {
  return (
    <section
      id="membership-application"
      aria-labelledby="membership-application-heading"
      className="rounded-xl border border-border-subtle bg-surface-raised px-5 py-6 shadow-xs sm:px-6"
    >
      <h2
        id="membership-application-heading"
        className="font-display text-xl font-semibold text-ink-900"
      >
        How to join
      </h2>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-ink-600">
        Online applications are not open yet. Send an enquiry through the Contact
        page, or speak with a committee member. Your details stay private — they
        are never published on this website.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={membershipApplicationConfig.enquiryHref}
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-ink-900 px-4 text-sm font-medium text-white hover:bg-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Enquire via Contact
        </Link>
        <Link
          href="/login"
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-border-default px-4 text-sm font-medium text-ink-800 hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Member sign in
        </Link>
        <Link
          href={membershipApplicationConfig.privacyHref}
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-border-default px-4 text-sm font-medium text-ink-800 hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Privacy policy
        </Link>
      </div>
    </section>
  );
}

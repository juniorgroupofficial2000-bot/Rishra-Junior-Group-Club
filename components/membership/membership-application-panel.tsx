import {
  membershipApplicationConfig,
  type MembershipApplicationDraft,
} from "@/content/membership";
import Link from "next/link";

/**
 * Public-facing stub for the future online application workflow.
 * Does not collect or display personal information.
 */
export function MembershipApplicationPanel({
  draft = { status: "not_started" },
}: {
  draft?: MembershipApplicationDraft;
}) {
  const enabled = membershipApplicationConfig.onlineApplicationsEnabled;

  return (
    <section
      id="membership-application"
      aria-labelledby="membership-application-heading"
      className="rounded-xl border border-dashed border-border-strong bg-surface-raised px-5 py-6 sm:px-6"
    >
      <h2
        id="membership-application-heading"
        className="font-display text-xl font-semibold text-ink-900"
      >
        Online application
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-500">
        Architecture is ready for a secure, server-side membership application
        workflow. Applicant details will never be rendered on public pages.
      </p>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-medium text-ink-800">Workflow status</dt>
          <dd className="text-ink-600">
            {enabled ? "Applications open" : "Coming soon — enquire via Contact"}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-ink-800">Your draft status</dt>
          <dd className="font-mono text-ink-600">{draft.status}</dd>
        </div>
      </dl>
      <div className="mt-5 flex flex-wrap gap-3">
        {enabled ? (
          <Link
            href="/membership/apply"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-ink-900 px-4 text-sm font-medium text-white hover:bg-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Start application
          </Link>
        ) : (
          <Link
            href={membershipApplicationConfig.enquiryHref}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-ink-900 px-4 text-sm font-medium text-white hover:bg-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Enquire instead
          </Link>
        )}
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

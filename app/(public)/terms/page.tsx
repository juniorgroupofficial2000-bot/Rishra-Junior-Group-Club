import { PublicPageShell } from "@/components/public";
import { publicPages } from "@/content/pages";
import { siteConfig } from "@/content/site";
import { JsonLd } from "@/lib/json-ld";
import { metadataForPublicPage } from "@/lib/seo/metadata";
import { webPageJsonLd } from "@/lib/seo/structured-data";

export const metadata = metadataForPublicPage("terms");

export default function TermsPage() {
  const page = publicPages.terms;

  return (
    <>
      <JsonLd
        data={webPageJsonLd({
          path: page.path,
          name: `${page.title} · Rishra Junior Group Club`,
          description: page.description,
          breadcrumbs: [
            { name: "Home", path: "/" },
            { name: page.title, path: page.path },
          ],
        })}
      />
      <PublicPageShell pageKey="terms">
        <article className="prose prose-ink max-w-prose space-y-6 text-base leading-relaxed text-ink-700">
          <p className="text-sm text-ink-500">
            Last updated: {siteConfig.legal.termsUpdated}
          </p>
          <p>
            These Terms of Use govern access to the Rishra Junior Group Club
            website, member portal, and admin portal (together, the “Service”).
            By using the Service you agree to these terms.
          </p>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-ink-900">
              The Service
            </h2>
            <p>
              The public site provides information about the Club, events,
              gallery, and heritage. The member portal is for enrolled members.
              The admin portal is for authorised staff only. The Club may update,
              suspend, or discontinue parts of the Service as needed for
              operations or security.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-ink-900">
              Accounts and acceptable use
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Keep login credentials confidential and use MFA when required.</li>
              <li>
                Do not attempt to access another member’s data, bypass
                authorisation, or abuse payment or webhook endpoints.
              </li>
              <li>
                Do not upload unlawful, harmful, or infringing content through
                admin tools.
              </li>
              <li>
                SAMPLE or demo records are fictional development data and must not
                be treated as real member or financial records.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-ink-900">
              Membership and payments
            </h2>
            <p>
              Membership status, dues, mandates, and receipts are managed
              according to Club policy and verified payment-provider events.
              Browser-side payment success screens are never the source of truth.
              Refunds and disputes follow Club process and the payment provider’s
              rules.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-ink-900">
              Intellectual property
            </h2>
            <p>
              Club branding, site design, and published content belong to the Club
              or their respective owners. You may not copy or redistribute Club
              materials for commercial use without permission.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-ink-900">
              Disclaimer
            </h2>
            <p>
              The Service is provided for Club operations on an “as available”
              basis. While we work to keep information accurate, some public pages
              may still contain labelled placeholders until the committee verifies
              facts. The Club is not liable for indirect losses arising from use
              of the Service except where law does not allow such limitation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-ink-900">
              Contact
            </h2>
            <p>
              Questions about these terms: {siteConfig.contact.email}. Address:{" "}
              {siteConfig.address.line1}, {siteConfig.address.line2},{" "}
              {siteConfig.address.line3}.
            </p>
          </section>
        </article>
      </PublicPageShell>
    </>
  );
}

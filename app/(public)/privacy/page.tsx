import { PublicPageShell } from "@/components/public";
import { publicPages } from "@/content/pages";
import { siteConfig } from "@/content/site";
import { JsonLd } from "@/lib/json-ld";
import { metadataForPublicPage } from "@/lib/seo/metadata";
import { webPageJsonLd } from "@/lib/seo/structured-data";

export const metadata = metadataForPublicPage("privacy");

export default function PrivacyPage() {
  const page = publicPages.privacy;

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
      <PublicPageShell pageKey="privacy">
        <article className="prose prose-ink max-w-prose space-y-6 text-base leading-relaxed text-ink-700">
          <p className="text-sm text-ink-500">
            Last updated: {siteConfig.legal.privacyUpdated}
          </p>
          <p>
            Rishra Junior Group Club (“the Club”, “we”) operates this website and
            member portals to share public club information and to manage
            membership, events, and dues for authorised members and staff.
          </p>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-ink-900">
              Information we collect
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Account details such as name, email address, phone number, and
                membership number when you register or are enrolled as a member.
              </li>
              <li>
                Payment and mandate references processed by our payment provider
                (for example Razorpay). We do not store full card numbers, CVV,
                or UPI PINs on Club servers.
              </li>
              <li>
                Technical logs needed for security and reliability (for example
                authentication failures, IP-derived rate-limit keys, and error
                digests). Passwords and payment secrets are never written to
                application logs.
              </li>
              <li>
                Content you submit through admin tools (announcements, events,
                gallery captions, documents metadata).
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-ink-900">
              How we use information
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Operate membership, dues, mandates, receipts, and event access.</li>
              <li>Publish public club information that the committee chooses to share.</li>
              <li>Secure the service, prevent abuse, and investigate incidents.</li>
              <li>Meet legal and accounting obligations related to club finances.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-ink-900">
              Sharing
            </h2>
            <p>
              We share personal data only with processors needed to run the
              Club’s digital services (hosting, database, email delivery, and
              payment providers), or when required by law. Member contact details
              are not published on the public website.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-ink-900">
              Retention and security
            </h2>
            <p>
              We retain membership and financial records for as long as needed
              for club operations and applicable law. Access to admin tools is
              role-based. Staff accounts that manage payments should use
              authenticator MFA. Transmission uses HTTPS in production.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-ink-900">
              Your choices
            </h2>
            <p>
              Members may review profile and membership information in the member
              portal. To correct data, close an account, or ask privacy questions,
              contact the Club using the details on the Contact page (
              {siteConfig.contact.email}).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-ink-900">
              Updates
            </h2>
            <p>
              We may update this policy as the platform changes. The “Last
              updated” date at the top will change when we do. Material changes
              affecting members will be communicated through the Club’s usual
              channels when practical.
            </p>
          </section>
        </article>
      </PublicPageShell>
    </>
  );
}

import { ContentPlaceholder, PublicPageShell } from "@/components/public";
import { formatAddressLines, siteConfig } from "@/content/site";
import { JsonLd } from "@/lib/json-ld";
import { metadataForPublicPage } from "@/lib/seo/metadata";
import { contactPageJsonLd } from "@/lib/seo/structured-data";

export const metadata = metadataForPublicPage("contact");

export default function ContactPage() {
  return (
    <>
      <JsonLd data={contactPageJsonLd()} />
      <PublicPageShell pageKey="contact">
        <div className="grid min-w-0 gap-6 lg:grid-cols-2">
          <section
            aria-labelledby="contact-address"
            className="rounded-xl border border-border-subtle bg-surface-raised p-5 shadow-xs sm:p-6"
          >
            <h2
              id="contact-address"
              className="font-display text-xl font-semibold text-ink-900"
            >
              Address
            </h2>
            <address className="mt-4 not-italic text-base leading-relaxed text-ink-700">
              {formatAddressLines().map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          </section>

          <section
            aria-labelledby="contact-channels"
            className="rounded-xl border border-border-subtle bg-surface-raised p-5 shadow-xs sm:p-6"
          >
            <h2
              id="contact-channels"
              className="font-display text-xl font-semibold text-ink-900"
            >
              Channels
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="font-medium text-ink-800">Email</dt>
                <dd className="text-ink-600">{siteConfig.contact.email}</dd>
              </div>
              <div>
                <dt className="font-medium text-ink-800">Phone</dt>
                <dd className="text-ink-600">{siteConfig.contact.phone}</dd>
              </div>
              <div>
                <dt className="font-medium text-ink-800">Hours</dt>
                <dd className="text-ink-600">{siteConfig.contact.hours}</dd>
              </div>
            </dl>
          </section>
        </div>
        <div className="mt-8">
          <ContentPlaceholder
            title="Contact form"
            body="A verified contact form will be added when email delivery is configured."
          />
        </div>
      </PublicPageShell>
    </>
  );
}

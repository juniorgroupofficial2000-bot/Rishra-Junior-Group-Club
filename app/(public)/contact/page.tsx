import { Reveal } from "@/components/motion";
import { EditorialPageHero } from "@/components/public/editorial-page-hero";
import { SiteContainer } from "@/components/public/site-container";
import { publicPages } from "@/content/pages";
import { formatAddressLines, siteConfig } from "@/content/site";
import { siteMedia } from "@/content/site-media";
import { JsonLd } from "@/lib/json-ld";
import { metadataForPublicPage } from "@/lib/seo/metadata";
import { contactPageJsonLd } from "@/lib/seo/structured-data";
import Link from "next/link";

export const metadata = metadataForPublicPage("contact");

function isConfiguredContactValue(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (v.startsWith("[") && v.endsWith("]")) return false;
  if (v.toLowerCase().includes("set contact_public")) return false;
  return true;
}

export default function ContactPage() {
  const page = publicPages.contact;
  const email = siteConfig.contact.email;
  const phone = siteConfig.contact.phone;
  const hours = siteConfig.contact.hours;
  const hasEmail = isConfiguredContactValue(email);
  const hasPhone = isConfiguredContactValue(phone);
  const hasHours = isConfiguredContactValue(hours);
  const hasChannels = hasEmail || hasPhone || hasHours;

  return (
    <>
      <JsonLd data={contactPageJsonLd()} />
      <EditorialPageHero
        layout="split"
        crumbs={[
          { label: "Home", href: "/" },
          { label: page.title },
        ]}
        eyebrow={page.eyebrow}
        title={page.title}
        description={page.description}
        media={siteMedia.contact}
      />

      <SiteContainer className="pb-20 pt-12 sm:pb-28 sm:pt-16">
        <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <section aria-labelledby="contact-address">
              <p className="type-caption text-ink-400">Visit</p>
              <h2
                id="contact-address"
                className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink-900"
              >
                Address
              </h2>
              <address className="mt-6 not-italic">
                {formatAddressLines().map((line) => (
                  <span
                    key={line}
                    className="block text-lg leading-relaxed text-ink-700"
                  >
                    {line}
                  </span>
                ))}
              </address>
            </section>
          </Reveal>

          <Reveal delay={0.08}>
            <section
              aria-labelledby="contact-channels"
              className="border-t border-border-subtle pt-8 lg:border-t-0 lg:border-l lg:pl-10 lg:pt-0"
            >
              <p className="type-caption text-ink-400">Channels</p>
              <h2
                id="contact-channels"
                className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink-900"
              >
                How to reach us
              </h2>
              {hasChannels ? (
                <dl className="mt-6 space-y-5">
                  {hasEmail ? (
                    <div>
                      <dt className="type-caption text-ink-400">Email</dt>
                      <dd className="mt-1 text-lg text-ink-800">
                        <a
                          href={`mailto:${email}`}
                          className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {email}
                        </a>
                      </dd>
                    </div>
                  ) : null}
                  {hasPhone ? (
                    <div>
                      <dt className="type-caption text-ink-400">Phone</dt>
                      <dd className="mt-1 text-lg text-ink-800">{phone}</dd>
                    </div>
                  ) : null}
                  {hasHours ? (
                    <div>
                      <dt className="type-caption text-ink-400">Hours</dt>
                      <dd className="mt-1 text-lg text-ink-800">{hours}</dd>
                    </div>
                  ) : null}
                </dl>
              ) : (
                <p className="mt-6 text-base leading-relaxed text-ink-600">
                  Public email and phone will be published when the committee
                  confirms them. Visit the address or speak with a committee
                  member in person.
                </p>
              )}
              <Link
                href="/membership"
                className="mt-8 inline-flex min-h-11 items-center text-sm font-semibold text-alta-600 underline-offset-4 hover:underline"
              >
                Membership enquiries →
              </Link>
            </section>
          </Reveal>
        </div>
      </SiteContainer>
    </>
  );
}

import { FadeIn } from "@/components/motion/fade-in";
import { SiteContainer } from "@/components/public/site-container";
import type { PujaSectionBlock } from "@/content/heritage";
import { cn } from "@/lib/cn";
import { HeritageImage } from "./heritage-image";
import { ProvenanceBadge } from "./provenance-badge";

type PujaSectionProps = {
  section: PujaSectionBlock;
  id?: string;
  reverse?: boolean;
  tone?: "default" | "raised" | "inverse";
};

export function PujaSection({
  section,
  id,
  reverse = false,
  tone = "default",
}: PujaSectionProps) {
  const headingId = `${section.id}-heading`;

  return (
    <section
      id={id ?? section.id}
      aria-labelledby={headingId}
      className={cn(
        "py-16 sm:py-20",
        tone === "raised" && "bg-surface-raised",
        tone === "inverse" && "bg-ink-900 text-white",
        tone === "default" && "border-b border-border-subtle",
      )}
    >
      <SiteContainer>
        <div
          className={cn(
            "grid items-center gap-10 lg:grid-cols-2 lg:gap-14",
            reverse && "lg:[&>*:first-child]:order-2",
          )}
        >
          <FadeIn className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <ProvenanceBadge provenance={section.provenance} />
            </div>
            <h2
              id={headingId}
              className={cn(
                "mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl",
                tone === "inverse" ? "text-white" : "text-ink-900",
              )}
            >
              {section.title}
            </h2>
            <div
              className={cn(
                "mt-5 space-y-4 text-base leading-relaxed",
                tone === "inverse" ? "text-ink-200" : "text-ink-600",
              )}
            >
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </FadeIn>
          {section.image ? (
            <FadeIn delay={0.08} slow className="min-w-0">
              <HeritageImage
                image={section.image}
                frameClassName="aspect-[4/3]"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </FadeIn>
          ) : null}
        </div>
      </SiteContainer>
    </section>
  );
}

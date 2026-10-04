import { FadeIn } from "@/components/motion/fade-in";
import { membershipSections } from "@/content/membership";

export function MembershipSections() {
  return (
    <div className="space-y-10">
      {membershipSections.map((section, index) => (
        <FadeIn key={section.id} delay={index * 0.03}>
          <section
            id={section.id}
            aria-labelledby={`${section.id}-heading`}
            className="scroll-mt-28 border-b border-border-subtle pb-10 last:border-b-0 last:pb-0"
          >
            <h2
              id={`${section.id}-heading`}
              className="font-display text-2xl font-semibold tracking-tight text-ink-900"
            >
              {section.title}
            </h2>
            <div className="mt-4 space-y-3 text-base leading-relaxed text-ink-600">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            {section.items?.length ? (
              <ol className="mt-5 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink-700 sm:text-base">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            ) : null}
          </section>
        </FadeIn>
      ))}
    </div>
  );
}

import { founderMembers } from "@/content/club-public";
import { metadataForPublicPage } from "@/lib/seo/metadata";

export const metadata = metadataForPublicPage("past-president");

export default function PastPresidentPage() {
  const president = founderMembers.find((member) => member.role === "President");

  return (
    <div className="bg-white text-[#2b2b2b]">
      <section className="mx-auto max-w-[720px] px-4 py-14 text-center">
        <h1 className="font-display text-4xl text-logo-blue">Past President</h1>
        {president ? (
          <article className="mt-10">
            <img
              src={president.portrait}
              alt={`${president.name}, ${president.role}`}
              className="mx-auto h-64 w-48 object-cover object-top"
            />
            <h2 className="mt-4 font-display text-2xl text-logo-blue">{president.name}</h2>
            <p className="mt-1 text-sm tracking-wide text-[#666]">{president.role}</p>
          </article>
        ) : null}
        <p className="mt-8 text-sm leading-7 text-[#666]">
          Earlier presidents will be added when the club provides their names.
        </p>
      </section>
    </div>
  );
}

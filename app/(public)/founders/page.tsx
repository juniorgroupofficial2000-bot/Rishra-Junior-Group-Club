import { founderMembers } from "@/content/club-public";
import { metadataForPublicPage } from "@/lib/seo/metadata";

export const metadata = metadataForPublicPage("founders");

export default function FoundersPage() {
  return (
    <div className="bg-white text-[#2b2b2b]">
      <section className="mx-auto max-w-[1100px] px-4 py-14">
        <h1 className="font-display text-4xl text-[#372F84]">Founder Members</h1>
        <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {founderMembers.map((member) => (
            <li key={member.name} className="text-center">
              <img
                src={member.portrait}
                alt={`${member.name}, ${member.role}`}
                className="mx-auto h-56 w-44 object-cover object-top"
              />
              <h2 className="mt-4 font-display text-xl text-[#372F84]">{member.name}</h2>
              <p className="mt-1 text-sm tracking-wide text-[#666]">{member.role}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

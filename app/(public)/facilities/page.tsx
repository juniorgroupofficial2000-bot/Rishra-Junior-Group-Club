import { placeholderFacilities } from "@/content/club-public";
import { metadataForPublicPage } from "@/lib/seo/metadata";

export const metadata = metadataForPublicPage("facilities");

export default function FacilitiesPage() {
  return (
    <div className="bg-white text-[#333333]">
      <section className="mx-auto max-w-[1100px] px-4 py-14">
        <h1 className="font-display text-4xl text-logo-blue">Facilities</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#333333]">
          These cards are placeholders. They will be replaced when the club publishes the real spaces and photographs.
        </p>
        <ul className="mt-10 grid gap-8 sm:grid-cols-2">
          {placeholderFacilities.map((item) => (
              <li key={item.title} className="bg-[#F8F9FA]">
              <img src={item.image} alt="" className="h-52 w-full object-cover" />
              <div className="p-5">
                <h2 className="font-display text-2xl text-logo-blue">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#333333]">{item.summary}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

import { ClubDataTable } from "@/components/public/club-data-table";
import { virtualFacilities } from "@/content/club-roster";
import { metadataForPublicPage } from "@/lib/seo/metadata";
import Link from "next/link";

export const metadata = metadataForPublicPage("facilities");

export default function FacilitiesPage() {
  return (
    <div className="bg-white text-[#333333]">
      <section className="mx-auto max-w-[1100px] px-4 py-14">
        <h1 className="font-display text-4xl text-logo-blue">Facilities</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7">
          Virtual club facilities and venue-owner pitch notes. These are partner-perk proposals for members, not owned club buildings.
        </p>
        <ClubDataTable
          columns={["Facility", "What the member gets", "Venue pitch"]}
          rows={virtualFacilities.map((item) => [item.title, item.perk, item.pitch])}
        />
        <p className="mt-8 text-sm">
          Event branding inventory is listed on the{" "}
          <Link href="/sponsorship" className="font-semibold text-logo-blue">
            Sponsorship
          </Link>{" "}
          page.
        </p>
      </section>
    </div>
  );
}

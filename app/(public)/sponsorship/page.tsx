import { ClubDataTable } from "@/components/public/club-data-table";
import { sponsorshipPackages } from "@/content/club-roster";
import { metadataForPublicPage } from "@/lib/seo/metadata";

export const metadata = metadataForPublicPage("sponsorship");

export default function SponsorshipPage() {
  return (
    <div className="bg-white text-[#333333]">
      <section className="mx-auto max-w-[1100px] px-4 py-14">
        <h1 className="font-display text-4xl text-logo-blue">Sponsorship</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7">
          Inventory for club events. Contact the committee to book a package.
        </p>
        <ClubDataTable
          columns={["Sl. No.", "Sponsorship item"]}
          rows={sponsorshipPackages.map((item, index) => [String(index + 1), item])}
        />
      </section>
    </div>
  );
}

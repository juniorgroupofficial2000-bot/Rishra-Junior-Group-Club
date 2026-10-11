import { ClubMemberGrid } from "@/components/public/club-member-grid";
import { metadataForPublicPage } from "@/lib/seo/metadata";

export const metadata = metadataForPublicPage("members");

export default function MembersPage() {
  return (
    <div className="bg-white text-[#333333]">
      <section className="mx-auto max-w-[1100px] px-4 py-14">
        <h1 className="font-display text-4xl text-logo-blue">Members</h1>
        <ClubMemberGrid />
      </section>
    </div>
  );
}

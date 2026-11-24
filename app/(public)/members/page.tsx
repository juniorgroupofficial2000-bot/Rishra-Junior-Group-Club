import { ClubDataTable } from "@/components/public/club-data-table";
import { juniorGroupMembers } from "@/content/club-roster";
import { metadataForPublicPage } from "@/lib/seo/metadata";

export const metadata = metadataForPublicPage("members");

export default function MembersPage() {
  return (
    <div className="bg-white text-[#333333]">
      <section className="mx-auto max-w-[1100px] px-4 py-14">
        <h1 className="font-display text-4xl text-logo-blue">Members</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7">
          Junior Group members in official order. Public listings show names and designations only.
        </p>
        <ClubDataTable
          columns={["Sl. No.", "Name", "Designation"]}
          rows={juniorGroupMembers.map((member) => [
            String(member.serial),
            member.name.toUpperCase(),
            member.role.toUpperCase(),
          ])}
        />
      </section>
    </div>
  );
}

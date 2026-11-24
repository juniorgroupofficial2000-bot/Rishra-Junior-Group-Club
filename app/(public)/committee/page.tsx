import { ClubDataTable } from "@/components/public/club-data-table";
import { ClubMemberGrid } from "@/components/public/club-member-grid";
import { SiteContainer } from "@/components/public/site-container";
import { governingBodyMembers } from "@/content/club-roster";
import { standingCommitteePageCopy } from "@/content/standing-committees";
import { JsonLd } from "@/lib/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { webPageJsonLd } from "@/lib/seo/structured-data";
import Link from "next/link";

export async function generateMetadata() {
  return buildMetadata({
    title: "Committee",
    description:
      "Governing body of Rishra Junior Group Club in official order. Public listings show names and roles only.",
    path: "/committee",
  });
}

export default function CommitteePage() {
  return (
    <>
      <JsonLd
        data={webPageJsonLd({
          path: "/committee",
          name: "Committee · Rishra Junior Group Club",
          description:
            "Governing body of Rishra Junior Group Club in official order. Public listings show names and roles only.",
          breadcrumbs: [
            { name: "Home", path: "/" },
            { name: "Committee", path: "/committee" },
          ],
        })}
      />
      <SiteContainer className="pb-20 pt-14 sm:pb-28 sm:pt-16">
        <h1 className="font-display text-4xl text-logo-blue">Committee</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#333333]">
          The governing body in official hierarchy. The full membership list is on{" "}
          <Link href="/members" className="font-semibold text-logo-blue">
            Members
          </Link>
          . Standing groups are on{" "}
          <Link href="/sub-committee" className="font-semibold text-logo-blue">
            Sub-Committee
          </Link>
          .
        </p>
        <ClubDataTable
          columns={["Sl. No.", "Name", "Designation"]}
          rows={governingBodyMembers.map((member) => [
            String(member.serial),
            member.name.toUpperCase(),
            member.role.toUpperCase(),
          ])}
        />
        <ClubMemberGrid />
        <aside className="mt-20 border-y border-border-subtle py-8 text-sm leading-relaxed text-ink-600">
          <p className="font-semibold text-ink-800">Privacy</p>
          <p className="mt-2 max-w-2xl">{standingCommitteePageCopy.privacyNote}</p>
        </aside>
      </SiteContainer>
    </>
  );
}

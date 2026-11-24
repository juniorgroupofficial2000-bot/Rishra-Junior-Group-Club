import { ClubDataTable } from "@/components/public/club-data-table";
import { subCommitteeReserveNote, subCommitteeRosters } from "@/content/club-roster";
import { JsonLd } from "@/lib/json-ld";
import { metadataForPublicPage } from "@/lib/seo/metadata";
import { webPageJsonLd } from "@/lib/seo/structured-data";

export const metadata = metadataForPublicPage("sub-committee");

export default function SubCommitteePage() {
  return (
    <div className="bg-white text-[#333333]">
      <JsonLd
        data={webPageJsonLd({
          path: "/sub-committee",
          name: "Sub-Committee · Rishra Junior Group Club",
          description:
            "Standing sub-committees of Rishra Junior Group Club with chairman, convenor, members, and ex-officio officers.",
          breadcrumbs: [
            { name: "Home", path: "/" },
            { name: "Sub-Committee", path: "/sub-committee" },
          ],
        })}
      />
      <section className="mx-auto max-w-[1000px] px-4 py-14">
        <h1 className="text-center font-display text-4xl tracking-[0.08em] text-logo-blue sm:text-5xl">
          SUB-COMMITTEE
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-7">
          Each sub-committee includes a Chairman, a Convenor, working members, and the President and Secretary as ex-officio heads.
        </p>
        <div className="mt-12 space-y-14">
          {subCommitteeRosters.map((committee) => (
            <section key={committee.slug}>
              <h2 className="text-center text-base tracking-[0.04em] text-[#222] sm:text-lg">
                {committee.name.toUpperCase()}
              </h2>
              {committee.aims ? (
                <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-[#555]">
                  {committee.aims}
                </p>
              ) : null}
              <ClubDataTable
                columns={["Name", "Designation"]}
                rows={committee.seats.map((seat) => [
                  seat.name.toUpperCase(),
                  seat.note ? `${seat.role.toUpperCase()} (${seat.note.toUpperCase()})` : seat.role.toUpperCase(),
                ])}
              />
            </section>
          ))}
        </div>
        <p className="mt-14 text-sm leading-7 text-[#555]">{subCommitteeReserveNote}</p>
      </section>
    </div>
  );
}

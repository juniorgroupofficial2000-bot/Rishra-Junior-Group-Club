import { standingCommitteePageCopy } from "@/content/standing-committees";
import { JsonLd } from "@/lib/json-ld";
import { metadataForPublicPage } from "@/lib/seo/metadata";
import { webPageJsonLd } from "@/lib/seo/structured-data";
import { loadPublishedSubCommittees } from "@/server/content/public-loaders";

export const metadata = metadataForPublicPage("sub-committee");

function committeeHeading(name: string, termYear?: number) {
  const title = name.toUpperCase();
  return termYear ? `${title} ${termYear}` : title;
}

export default async function SubCommitteePage() {
  const committees = await loadPublishedSubCommittees();

  return (
    <div className="bg-white text-[#2b2b2b]">
      <JsonLd
        data={webPageJsonLd({
          path: "/sub-committee",
          name: "Sub-Committee · Rishra Junior Group Club",
          description:
            "Standing sub-committees of Rishra Junior Group Club. Public listings show names and roles only.",
          breadcrumbs: [
            { name: "Home", path: "/" },
            { name: "Sub-Committee", path: "/sub-committee" },
          ],
        })}
      />
      <section className="grid min-h-[220px] md:grid-cols-2 md:min-h-[320px]">
        <div
          className="min-h-[180px] bg-cover bg-center"
          style={{ backgroundImage: "url(/images/home/hero-placeholder-a.svg)" }}
          role="img"
          aria-label="Placeholder club photograph"
        />
        <div
          className="min-h-[180px] bg-cover bg-center"
          style={{ backgroundImage: "url(/images/home/hero-placeholder-b.svg)" }}
          role="img"
          aria-label="Placeholder club photograph"
        />
      </section>

      <section className="mx-auto max-w-[1000px] px-4 py-14">
        <h1 className="text-center font-display text-4xl tracking-[0.08em] text-logo-blue sm:text-5xl">
          SUB-COMMITTEE
        </h1>

        {committees.length === 0 ? (
          <p className="mt-12 text-center text-sm text-[#666]">
            {standingCommitteePageCopy.emptyCommittees}
          </p>
        ) : (
          <div className="mt-12 space-y-14">
            {committees.map((committee) => (
              <section key={committee.id}>
                <h2 className="text-center text-base tracking-[0.04em] text-[#222] sm:text-lg">
                  {committeeHeading(committee.name, committee.termYear)}
                </h2>
                {committee.seats.length === 0 ? (
                  <p className="mt-4 text-center text-sm text-[#666]">
                    {standingCommitteePageCopy.emptyMembers}
                  </p>
                ) : (
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[32rem] border-collapse text-sm">
                      <thead>
                        <tr className="bg-logo-blue text-left text-white">
                          <th className="px-4 py-3 font-semibold">Name</th>
                          <th className="px-4 py-3 font-semibold">Designation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {committee.seats.map((seat) => (
                          <tr key={seat.id} className="border-b border-[#e5e5e5]">
                            <td className="px-4 py-3">{seat.displayName}</td>
                            <td className="px-4 py-3 uppercase">{seat.role}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

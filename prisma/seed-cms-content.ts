import { committeeMembers } from "@/content/committee";
import { homeContent } from "@/content/home";
import { timelineEntries } from "@/content/heritage/timeline";
import { saraswatiPujaContent } from "@/content/heritage/saraswati-puja";
import { includeSampleContent } from "@/content/include-sample";
import type { PrismaClient } from "@prisma/client";

/**
 * Upserts public CMS rows from file content (idempotent).
 *
 * Development/demo only when invoked from `prisma/seed.ts` (blocked in
 * production unless ALLOW_DEMO_SEED=true). SAMPLE / placeholder heritage
 * rows are skipped unless CONTENT_INCLUDE_SAMPLE=true.
 *
 * Verified bootstrap (committee roster, FAQ, home brand copy, verified
 * timeline/puja years) can be used once to populate an empty CMS — after
 * that, the admin portal is the source of truth.
 */
export async function seedPublicCmsContent(
  prisma: PrismaClient,
  actorUserId?: string | null,
) {
  const now = new Date();
  const actor = actorUserId ?? null;
  const allowSample = includeSampleContent();

  const homeSections = [
    ["home.hero", "Homepage hero", homeContent.hero],
    ["home.intro", "Homepage intro", homeContent.intro],
    ["home.heritage", "Homepage heritage", homeContent.heritage],
    ["home.puja", "Homepage puja", homeContent.puja],
    ["home.committee", "Homepage committee", homeContent.committee],
    ["home.events", "Homepage events", homeContent.events],
    ["home.gallery", "Homepage gallery", homeContent.gallery],
    ["home.announcements", "Homepage announcements", homeContent.announcements],
    ["home.membership", "Homepage membership", homeContent.membership],
    ["home.location", "Homepage location", homeContent.location],
  ] as const;

  for (const [key, title, body] of homeSections) {
    await prisma.siteContentBlock.upsert({
      where: { key },
      create: {
        key,
        title,
        body,
        status: "PUBLISHED",
        historicallyImportant: key === "home.hero" || key === "home.heritage",
        sortOrder: homeSections.findIndex(([k]) => k === key) * 10,
        createdById: actor,
        updatedById: actor,
        updatedAt: now,
      },
      update: {
        title,
        body,
        updatedById: actor,
        updatedAt: now,
      },
    });
  }

  for (const entry of timelineEntries) {
    if (
      (!allowSample && entry.provenance === "sample") ||
      entry.provenance === "placeholder"
    ) {
      continue;
    }
    const existing = await prisma.timelineEntry.findFirst({
      where: { title: entry.title, yearLabel: entry.year, deletedAt: null },
    });
    const payload = {
      yearLabel: entry.year,
      date: entry.date ?? null,
      title: entry.title,
      description: entry.description,
      imageJson: entry.image ?? undefined,
      galleryJson: entry.gallery ?? undefined,
      milestone: entry.milestone,
      sortOrder: entry.sortOrder,
      status: entry.published ? ("PUBLISHED" as const) : ("DRAFT" as const),
      provenance: entry.provenance,
      historicallyImportant: entry.provenance === "verified",
      isSample: entry.provenance === "sample",
      updatedById: actor,
      updatedAt: now,
    };
    if (existing) {
      await prisma.timelineEntry.update({
        where: { id: existing.id },
        data: payload,
      });
    } else {
      await prisma.timelineEntry.create({
        data: { ...payload, createdById: actor },
      });
    }
  }

  const archiveYears = saraswatiPujaContent.archive.years;
  for (const year of archiveYears) {
    if (!allowSample && year.provenance === "sample") {
      continue;
    }
    const galleryJson =
      "gallery" in year && year.gallery != null ? year.gallery : undefined;
    const href =
      "href" in year && typeof year.href === "string" ? year.href : null;
    await prisma.pujaYear.upsert({
      where: { year: year.year },
      create: {
        year: year.year,
        title: year.title,
        summary: year.summary,
        highlights: year.highlights ?? undefined,
        coverJson: year.coverImage ?? undefined,
        galleryJson,
        href,
        sortOrder: 2100 - year.year,
        status: year.published ? "PUBLISHED" : "DRAFT",
        provenance: year.provenance,
        historicallyImportant: year.provenance === "verified",
        isSample: year.provenance === "sample",
        createdById: actor,
        updatedById: actor,
        updatedAt: now,
      },
      update: {
        title: year.title,
        summary: year.summary,
        highlights: year.highlights ?? undefined,
        coverJson: year.coverImage ?? undefined,
        updatedById: actor,
        updatedAt: now,
      },
    });
  }

  for (const member of committeeMembers) {
    // Match by legal name so role corrections (e.g. VP → committee member)
    // update the existing published row instead of creating a duplicate.
    const existing = await prisma.publicCommitteeMember.findFirst({
      where: {
        name: member.name,
        deletedAt: null,
      },
    });
    const payload = {
      roleKey: member.roleKey,
      roleTitle: member.role,
      name: member.name,
      familiarName: member.familiarName ?? null,
      displayName: member.displayName,
      sortOrder: member.sortOrder,
      status: member.published ? ("PUBLISHED" as const) : ("DRAFT" as const),
      historicallyImportant: member.roleKey === "president",
      updatedById: actor,
      updatedAt: now,
    };
    if (existing) {
      await prisma.publicCommitteeMember.update({
        where: { id: existing.id },
        data: payload,
      });
    } else {
      await prisma.publicCommitteeMember.create({
        data: { ...payload, createdById: actor },
      });
    }
  }

  const faqSeed = [
    {
      question: "When did the club begin organizing Saraswati Puja?",
      answer:
        "Rishra Junior Group Club has been organizing Saraswati Puja since 1 February 2000.",
      sortOrder: 10,
      historicallyImportant: true,
    },
    {
      question: "Where is the club located?",
      answer:
        "The club is based in Morepukur, Natun Gram, Rishra. See the Contact page for the full address and hours.",
      sortOrder: 20,
      historicallyImportant: false,
    },
    {
      question: "How can I enquire about membership?",
      answer:
        "Use the Membership page to learn about the process, then contact the club through the Contact page. Personal applications are reviewed by the committee.",
      sortOrder: 30,
      historicallyImportant: false,
    },
  ];

  for (const faq of faqSeed) {
    const existing = await prisma.faqItem.findFirst({
      where: { question: faq.question, deletedAt: null },
    });
    if (existing) {
      await prisma.faqItem.update({
        where: { id: existing.id },
        data: {
          answer: faq.answer,
          sortOrder: faq.sortOrder,
          status: "PUBLISHED",
          historicallyImportant: faq.historicallyImportant,
          updatedById: actor,
          updatedAt: now,
        },
      });
    } else {
      await prisma.faqItem.create({
        data: {
          ...faq,
          status: "PUBLISHED",
          createdById: actor,
          updatedById: actor,
          updatedAt: now,
        },
      });
    }
  }

  // Align existing event/album published flags with contentStatus.
  await prisma.event.updateMany({
    where: { published: true, deletedAt: null },
    data: { contentStatus: "PUBLISHED" },
  });
  await prisma.galleryAlbum.updateMany({
    where: { published: true, deletedAt: null },
    data: { contentStatus: "PUBLISHED" },
  });

  // Standing committees + executive memberships (relational, Member-centric).
  const { seedStandingCommittees } = await import("./seed-standing-committees");
  await seedStandingCommittees(prisma, actor);
}

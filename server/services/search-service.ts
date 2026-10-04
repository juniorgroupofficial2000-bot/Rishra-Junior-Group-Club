import "server-only";

import { includeSampleContent } from "@/content/include-sample";
import { prisma } from "@/server/db/prisma";

export type PublicSearchResult = {
  type: "announcement" | "event" | "gallery" | "committee" | "page";
  id: string;
  title: string;
  summary: string;
  href: string;
};

export type AdminSearchResult = {
  type: "member" | "event" | "announcement" | "payment" | "user";
  id: string;
  title: string;
  summary: string;
  href: string;
};

const PUBLIC_PAGES: Array<{
  title: string;
  summary: string;
  href: string;
  keywords: string[];
}> = [
  {
    title: "About the club",
    summary: "History, purpose, and community of Rishra Junior Group Club.",
    href: "/about",
    keywords: ["about", "club", "rishra", "junior"],
  },
  {
    title: "Saraswati Puja",
    summary: "Annual Saraswati Puja archive, schedule, and galleries.",
    href: "/saraswati-puja",
    keywords: ["puja", "saraswati", "festival"],
  },
  {
    title: "Membership",
    summary: "How to join and what membership includes.",
    href: "/membership",
    keywords: ["membership", "join", "apply"],
  },
  {
    title: "Contact",
    summary: "Reach the club committee.",
    href: "/contact",
    keywords: ["contact", "email", "phone", "location"],
  },
  {
    title: "FAQ",
    summary: "Common questions about membership and events.",
    href: "/faq",
    keywords: ["faq", "help", "questions"],
  },
];

function normalizeQuery(q: string) {
  return q.trim().replace(/\s+/g, " ").slice(0, 80);
}

function contains(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

export async function searchPublicContent(
  rawQuery: string,
): Promise<PublicSearchResult[]> {
  const q = normalizeQuery(rawQuery);
  if (q.length < 2) return [];

  const allowSample = includeSampleContent();
  const now = new Date();

  const [announcements, events, albums, committee] = await Promise.all([
    prisma.announcement.findMany({
      where: {
        deletedAt: null,
        ...(allowSample ? {} : { isSample: false }),
        OR: [
          { status: "PUBLISHED" },
          { status: "SCHEDULED", publishedAt: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { summary: { contains: q, mode: "insensitive" } },
              { body: { contains: q, mode: "insensitive" } },
              { category: { contains: q, mode: "insensitive" } },
            ],
          },
        ],
      },
      orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }],
      take: 8,
      select: {
        id: true,
        title: true,
        summary: true,
        slug: true,
        category: true,
      },
    }),
    prisma.event.findMany({
      where: {
        deletedAt: null,
        contentStatus: "PUBLISHED",
        published: true,
        ...(allowSample ? {} : { isSample: false }),
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { venueLabel: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { startsAt: "desc" },
      take: 8,
      select: {
        id: true,
        title: true,
        description: true,
        slug: true,
        venueLabel: true,
      },
    }),
    prisma.galleryAlbum.findMany({
      where: {
        deletedAt: null,
        contentStatus: "PUBLISHED",
        ...(allowSample ? {} : { isSample: false }),
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { sortOrder: "asc" },
      take: 6,
      select: {
        id: true,
        title: true,
        description: true,
        slug: true,
      },
    }),
    prisma.publicCommitteeMember.findMany({
      where: {
        deletedAt: null,
        status: "PUBLISHED",
        OR: [
          { displayName: { contains: q, mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
          { roleTitle: { contains: q, mode: "insensitive" } },
          { biography: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 6,
      select: {
        id: true,
        displayName: true,
        roleTitle: true,
        biography: true,
      },
    }),
  ]);

  const pageHits = PUBLIC_PAGES.filter(
    (page) =>
      contains(page.title, q) ||
      contains(page.summary, q) ||
      page.keywords.some((keyword) => contains(keyword, q)),
  ).map((page) => ({
    type: "page" as const,
    id: page.href,
    title: page.title,
    summary: page.summary,
    href: page.href,
  }));

  return [
    ...announcements.map((row) => ({
      type: "announcement" as const,
      id: row.id,
      title: row.title,
      summary: row.summary ?? row.category,
      href: `/announcements/${row.slug}`,
    })),
    ...events.map((row) => ({
      type: "event" as const,
      id: row.id,
      title: row.title,
      summary: row.venueLabel ?? row.description?.slice(0, 120) ?? "Event",
      href: `/events/${row.slug}`,
    })),
    ...albums.map((row) => ({
      type: "gallery" as const,
      id: row.id,
      title: row.title,
      summary: row.description?.slice(0, 120) ?? "Gallery album",
      href: `/gallery/${row.slug}`,
    })),
    ...committee.map((row) => ({
      type: "committee" as const,
      id: row.id,
      title: row.displayName,
      summary: row.roleTitle || row.biography?.slice(0, 120) || "Committee member",
      href: "/committee",
    })),
    ...pageHits,
  ].slice(0, 30);
}

export async function searchAdminContent(
  rawQuery: string,
): Promise<AdminSearchResult[]> {
  const q = normalizeQuery(rawQuery);
  if (q.length < 2) return [];

  const [members, events, announcements, payments, users] = await Promise.all([
    prisma.member.findMany({
      where: {
        deletedAt: null,
        OR: [
          { membershipNumber: { contains: q, mode: "insensitive" } },
          { displayName: { contains: q, mode: "insensitive" } },
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 10,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        displayName: true,
        membershipNumber: true,
        status: true,
        email: true,
      },
    }),
    prisma.event.findMany({
      where: {
        deletedAt: null,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { slug: { contains: q, mode: "insensitive" } },
          { venueLabel: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 8,
      orderBy: { startsAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        startsAt: true,
      },
    }),
    prisma.announcement.findMany({
      where: {
        deletedAt: null,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { slug: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 8,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        category: true,
      },
    }),
    prisma.payment.findMany({
      where: {
        deletedAt: null,
        OR: [
          { id: { contains: q, mode: "insensitive" } },
          { providerPaymentRef: { contains: q, mode: "insensitive" } },
          { providerOrderRef: { contains: q, mode: "insensitive" } },
          { member: { displayName: { contains: q, mode: "insensitive" } } },
          { member: { membershipNumber: { contains: q, mode: "insensitive" } } },
        ],
      },
      take: 8,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        amountPaise: true,
        member: { select: { displayName: true, membershipNumber: true } },
      },
    }),
    prisma.user.findMany({
      where: {
        deletedAt: null,
        OR: [
          { email: { contains: q, mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 6,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    }),
  ]);

  return [
    ...members.map((row) => ({
      type: "member" as const,
      id: row.id,
      title: row.displayName,
      summary: `${row.membershipNumber} · ${row.status} · ${row.email}`,
      href: `/admin/members/${row.id}`,
    })),
    ...events.map((row) => ({
      type: "event" as const,
      id: row.id,
      title: row.title,
      summary: `${row.status} · ${row.startsAt.toISOString().slice(0, 16)}`,
      href: `/admin/events/${row.id}`,
    })),
    ...announcements.map((row) => ({
      type: "announcement" as const,
      id: row.id,
      title: row.title,
      summary: `${row.status} · ${row.category}`,
      href: `/admin/content/announcements/${row.id}`,
    })),
    ...payments.map((row) => ({
      type: "payment" as const,
      id: row.id,
      title: `Payment · ${row.member.displayName}`,
      summary: `${row.member.membershipNumber} · ${row.status} · ₹${(
        row.amountPaise / 100
      ).toFixed(2)}`,
      href: `/admin/payments?query=${encodeURIComponent(row.id)}`,
    })),
    ...users.map((row) => ({
      type: "user" as const,
      id: row.id,
      title: row.name ?? row.email,
      summary: `${row.email} · ${row.role}`,
      href: `/admin/users?query=${encodeURIComponent(row.email)}`,
    })),
  ].slice(0, 40);
}

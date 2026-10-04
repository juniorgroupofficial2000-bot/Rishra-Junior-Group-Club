import "server-only";

import type { PaginatedResult } from "@/lib/admin/list-params";
import { toCsvLine } from "@/server/csv/parse-csv";
import { formatRoleLabel, type AppRole } from "@/server/domain/roles";
import { prisma } from "@/server/db/prisma";
import { formatAmountLabel } from "@/server/repositories/prisma/mappers";
import type {
  AnnouncementStatus,
  EventStatus,
  MandateStatus,
  MembershipStatus,
  PaymentStatus,
  Prisma,
} from "@prisma/client";

function clampPage(page: number, pageSize: number) {
  const safePage = Math.max(1, page);
  const safeSize = Math.min(100, Math.max(1, pageSize));
  return { page: safePage, pageSize: safeSize, skip: (safePage - 1) * safeSize };
}

export async function searchAdminPayments(input: {
  query?: string;
  status?: string;
  memberId?: string;
  from?: Date;
  to?: Date;
  page?: number;
  pageSize?: number;
}): Promise<
  PaginatedResult<{
    id: string;
    memberId: string;
    memberName: string;
    membershipNumber: string;
    amountLabel: string;
    status: string;
    method: string;
    paidAt: string | null;
    createdAt: string;
    receiptNumber: string | null;
    invoiceNumber: string | null;
    providerPaymentRef: string | null;
    isSample: boolean;
  }>
> {
  const { page, pageSize, skip } = clampPage(input.page ?? 1, input.pageSize ?? 20);
  const query = input.query?.trim();
  const where: Prisma.PaymentWhereInput = {
    deletedAt: null,
    ...(input.status ? { status: input.status as PaymentStatus } : {}),
    ...(input.memberId ? { memberId: input.memberId } : {}),
    ...(input.from || input.to
      ? {
          createdAt: {
            ...(input.from ? { gte: input.from } : {}),
            ...(input.to ? { lte: input.to } : {}),
          },
        }
      : {}),
    ...(query
      ? {
          OR: [
            { providerPaymentRef: { contains: query, mode: "insensitive" } },
            { providerOrderRef: { contains: query, mode: "insensitive" } },
            { member: { displayName: { contains: query, mode: "insensitive" } } },
            {
              member: {
                membershipNumber: { contains: query, mode: "insensitive" },
              },
            },
            { member: { email: { contains: query, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [total, rows] = await prisma.$transaction([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      include: {
        member: {
          select: { id: true, displayName: true, membershipNumber: true },
        },
        receipt: { select: { number: true } },
        invoice: { select: { number: true } },
      },
      orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
      skip,
      take: pageSize,
    }),
  ]);

  return {
    total,
    page,
    pageSize,
    items: rows.map((payment) => ({
      id: payment.id,
      memberId: payment.member.id,
      memberName: payment.member.displayName,
      membershipNumber: payment.member.membershipNumber,
      amountLabel: formatAmountLabel(payment.amountPaise, payment.currency),
      status: payment.status,
      method: payment.method,
      paidAt: payment.paidAt?.toISOString() ?? null,
      createdAt: payment.createdAt.toISOString(),
      receiptNumber: payment.receipt?.number ?? null,
      invoiceNumber: payment.invoice?.number ?? null,
      providerPaymentRef: payment.providerPaymentRef,
      isSample: payment.isSample,
    })),
  };
}

export async function searchAdminMandates(input: {
  query?: string;
  status?: string;
  memberId?: string;
  from?: Date;
  to?: Date;
  page?: number;
  pageSize?: number;
}) {
  const { page, pageSize, skip } = clampPage(input.page ?? 1, input.pageSize ?? 20);
  const query = input.query?.trim();
  const where: Prisma.PaymentMandateWhereInput = {
    deletedAt: null,
    ...(input.status ? { status: input.status as MandateStatus } : {}),
    ...(input.memberId ? { memberId: input.memberId } : {}),
    ...(input.from || input.to
      ? {
          updatedAt: {
            ...(input.from ? { gte: input.from } : {}),
            ...(input.to ? { lte: input.to } : {}),
          },
        }
      : {}),
    ...(query
      ? {
          OR: [
            { providerMandateRef: { contains: query, mode: "insensitive" } },
            { providerSubscriptionRef: { contains: query, mode: "insensitive" } },
            { member: { displayName: { contains: query, mode: "insensitive" } } },
            {
              member: {
                membershipNumber: { contains: query, mode: "insensitive" },
              },
            },
          ],
        }
      : {}),
  };

  const [total, rows] = await prisma.$transaction([
    prisma.paymentMandate.count({ where }),
    prisma.paymentMandate.findMany({
      where,
      include: {
        member: {
          select: { id: true, displayName: true, membershipNumber: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take: pageSize,
    }),
  ]);

  return {
    total,
    page,
    pageSize,
    items: rows.map((mandate) => ({
      id: mandate.id,
      memberId: mandate.member.id,
      memberName: mandate.member.displayName,
      membershipNumber: mandate.member.membershipNumber,
      status: mandate.status,
      provider: mandate.provider,
      providerMandateRef: mandate.providerMandateRef,
      nextDebitAt: mandate.nextDebitAt?.toISOString() ?? null,
      amountLabel:
        mandate.amountPaise != null
          ? formatAmountLabel(mandate.amountPaise, mandate.currency)
          : "—",
      lastStatusAt: mandate.lastStatusAt?.toISOString() ?? null,
      isSample: mandate.isSample,
    })),
  };
}

export async function searchAdminMemberships(input: {
  query?: string;
  status?: string;
  expiring?: string;
  page?: number;
  pageSize?: number;
}) {
  const { page, pageSize, skip } = clampPage(input.page ?? 1, input.pageSize ?? 20);
  const query = input.query?.trim();
  const now = new Date();
  const expiringBefore = new Date(now);
  expiringBefore.setDate(expiringBefore.getDate() + 30);
  const and: Prisma.MembershipWhereInput[] = [];
  if (input.expiring === "1") {
    and.push({
      status: "ACTIVE",
      isCurrent: true,
      OR: [
        { endsOn: { gte: now, lte: expiringBefore } },
        { nextDueOn: { gte: now, lte: expiringBefore } },
      ],
    });
  } else if (input.status) {
    and.push({ status: input.status as MembershipStatus });
  }
  if (query) {
    and.push({
      OR: [
        { member: { displayName: { contains: query, mode: "insensitive" } } },
        {
          member: {
            membershipNumber: { contains: query, mode: "insensitive" },
          },
        },
        { plan: { name: { contains: query, mode: "insensitive" } } },
        { plan: { code: { contains: query, mode: "insensitive" } } },
      ],
    });
  }
  const where: Prisma.MembershipWhereInput = {
    deletedAt: null,
    ...(and.length > 0 ? { AND: and } : {}),
  };

  const [total, rows] = await prisma.$transaction([
    prisma.membership.count({ where }),
    prisma.membership.findMany({
      where,
      include: {
        member: {
          select: { id: true, displayName: true, membershipNumber: true },
        },
        plan: { select: { code: true, name: true, amountPaise: true, currency: true } },
      },
      orderBy: [{ isCurrent: "desc" }, { updatedAt: "desc" }],
      skip,
      take: pageSize,
    }),
  ]);

  return {
    total,
    page,
    pageSize,
    items: rows.map((row) => ({
      id: row.id,
      memberId: row.member.id,
      memberName: row.member.displayName,
      membershipNumber: row.member.membershipNumber,
      planCode: row.plan.code,
      planName: row.plan.name,
      amountLabel: formatAmountLabel(row.plan.amountPaise, row.plan.currency),
      status: row.status,
      isCurrent: row.isCurrent,
      startsOn: row.startsOn?.toISOString().slice(0, 10) ?? null,
      nextDueOn: row.nextDueOn?.toISOString().slice(0, 10) ?? null,
    })),
  };
}

export async function searchAdminEvents(input: {
  query?: string;
  status?: string;
  published?: string;
  needsAction?: string;
  page?: number;
  pageSize?: number;
}) {
  const { page, pageSize, skip } = clampPage(input.page ?? 1, input.pageSize ?? 20);
  const query = input.query?.trim();
  const now = new Date();
  const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60_000);
  const ninetyDays = new Date(now.getTime() + 90 * 24 * 60 * 60_000);

  const and: Prisma.EventWhereInput[] = [];
  if (input.status) and.push({ status: input.status as EventStatus });
  if (input.published === "true") and.push({ published: true });
  if (input.published === "false") and.push({ published: false });
  if (input.needsAction === "1") {
    and.push({
      OR: [
        {
          contentStatus: "DRAFT",
          startsAt: { gte: now, lte: ninetyDays },
        },
        {
          status: "SCHEDULED",
          published: true,
          startsAt: { gte: now, lte: weekAhead },
          registrationRequired: true,
        },
      ],
    });
  }
  if (query) {
    and.push({
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { slug: { contains: query, mode: "insensitive" } },
        { venueLabel: { contains: query, mode: "insensitive" } },
      ],
    });
  }
  const where: Prisma.EventWhereInput = {
    deletedAt: null,
    ...(and.length > 0 ? { AND: and } : {}),
  };

  const [total, rows] = await prisma.$transaction([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      orderBy: { startsAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        slug: true,
        title: true,
        startsAt: true,
        venueLabel: true,
        status: true,
        published: true,
        contentStatus: true,
        category: true,
        registrationRequired: true,
        capacity: true,
        isSample: true,
        _count: { select: { registrations: true } },
      },
    }),
  ]);

  return { total, page, pageSize, items: rows };
}

export async function searchAdminPublicCommittee(input: {
  query?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const { page, pageSize, skip } = clampPage(input.page ?? 1, input.pageSize ?? 20);
  const query = input.query?.trim();
  const where: Prisma.PublicCommitteeMemberWhereInput = {
    deletedAt: null,
    ...(input.status
      ? { status: input.status as "DRAFT" | "PUBLISHED" | "ARCHIVED" }
      : {}),
    ...(query
      ? {
          OR: [
            { displayName: { contains: query, mode: "insensitive" } },
            { name: { contains: query, mode: "insensitive" } },
            { roleTitle: { contains: query, mode: "insensitive" } },
            { roleKey: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, rows] = await prisma.$transaction([
    prisma.publicCommitteeMember.count({ where }),
    prisma.publicCommitteeMember.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { displayName: "asc" }],
      skip,
      take: pageSize,
      select: {
        id: true,
        displayName: true,
        name: true,
        roleTitle: true,
        roleKey: true,
        termYear: true,
        sortOrder: true,
        status: true,
        portraitAssetId: true,
        biography: true,
      },
    }),
  ]);

  return { total, page, pageSize, items: rows };
}

export async function searchAdminGallery(input: {
  query?: string;
  published?: string;
  page?: number;
  pageSize?: number;
}) {
  const { page, pageSize, skip } = clampPage(input.page ?? 1, input.pageSize ?? 20);
  const query = input.query?.trim();
  const where: Prisma.GalleryAlbumWhereInput = {
    deletedAt: null,
    ...(input.published === "true"
      ? { published: true }
      : input.published === "false"
        ? { published: false }
        : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { slug: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, rows] = await prisma.$transaction([
    prisma.galleryAlbum.count({ where }),
    prisma.galleryAlbum.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        slug: true,
        title: true,
        published: true,
        isSample: true,
        updatedAt: true,
        _count: { select: { media: true } },
      },
    }),
  ]);

  return { total, page, pageSize, items: rows };
}

export async function searchAdminAnnouncements(input: {
  query?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const { page, pageSize, skip } = clampPage(input.page ?? 1, input.pageSize ?? 20);
  const query = input.query?.trim();
  const where: Prisma.AnnouncementWhereInput = {
    deletedAt: null,
    ...(input.status ? { status: input.status as AnnouncementStatus } : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { slug: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, rows] = await prisma.$transaction([
    prisma.announcement.count({ where }),
    prisma.announcement.findMany({
      where,
      orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }],
      skip,
      take: pageSize,
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        pinned: true,
        publishedAt: true,
        isSample: true,
      },
    }),
  ]);

  return { total, page, pageSize, items: rows };
}

/** Historical / completed club events (history archive). */
export async function searchAdminHistory(input: {
  query?: string;
  page?: number;
  pageSize?: number;
}) {
  return searchAdminEvents({
    ...input,
    status: "COMPLETED",
  });
}

/** Puja-related events and announcements for archive ops. */
export async function searchAdminPujaArchive(input: {
  query?: string;
  page?: number;
  pageSize?: number;
}) {
  const { page, pageSize, skip } = clampPage(input.page ?? 1, input.pageSize ?? 20);
  const query = input.query?.trim();
  const pujaClause = {
    OR: [
      { title: { contains: "puja", mode: "insensitive" as const } },
      { title: { contains: "saraswati", mode: "insensitive" as const } },
      { slug: { contains: "puja", mode: "insensitive" as const } },
      { slug: { contains: "saraswati", mode: "insensitive" as const } },
    ],
  };

  const eventWhere: Prisma.EventWhereInput = {
    deletedAt: null,
    AND: [
      pujaClause,
      ...(query
        ? [
            {
              OR: [
                { title: { contains: query, mode: "insensitive" as const } },
                { slug: { contains: query, mode: "insensitive" as const } },
              ],
            },
          ]
        : []),
    ],
  };

  const announcementWhere: Prisma.AnnouncementWhereInput = {
    deletedAt: null,
    AND: [
      pujaClause,
      ...(query
        ? [
            {
              OR: [
                { title: { contains: query, mode: "insensitive" as const } },
                { slug: { contains: query, mode: "insensitive" as const } },
              ],
            },
          ]
        : []),
    ],
  };

  const [eventTotal, events, announcementTotal, announcements] =
    await prisma.$transaction([
      prisma.event.count({ where: eventWhere }),
      prisma.event.findMany({
        where: eventWhere,
        orderBy: { startsAt: "desc" },
        take: 50,
        select: {
          id: true,
          slug: true,
          title: true,
          startsAt: true,
          status: true,
          published: true,
        },
      }),
      prisma.announcement.count({ where: announcementWhere }),
      prisma.announcement.findMany({
        where: announcementWhere,
        orderBy: { publishedAt: "desc" },
        take: 50,
        select: {
          id: true,
          slug: true,
          title: true,
          status: true,
          publishedAt: true,
        },
      }),
    ]);

  const items = [
    ...events.map((event) => ({
      id: `event:${event.id}`,
      kind: "event" as const,
      title: event.title,
      slug: event.slug,
      status: event.status,
      occurredOn: event.startsAt.toISOString().slice(0, 10),
      published: event.published,
    })),
    ...announcements.map((item) => ({
      id: `announcement:${item.id}`,
      kind: "announcement" as const,
      title: item.title,
      slug: item.slug,
      status: item.status,
      occurredOn: item.publishedAt?.toISOString().slice(0, 10) ?? null,
      published: item.status === "PUBLISHED",
    })),
  ]
    .sort((a, b) => (b.occurredOn ?? "").localeCompare(a.occurredOn ?? ""))
    .slice(skip, skip + pageSize);

  return {
    total: eventTotal + announcementTotal,
    page,
    pageSize,
    items,
  };
}

export async function searchAdminCommittee(input: {
  query?: string;
  page?: number;
  pageSize?: number;
}) {
  const { page, pageSize, skip } = clampPage(input.page ?? 1, input.pageSize ?? 20);
  const query = input.query?.trim();
  const where: Prisma.CommitteeAssignmentWhereInput = {
    deletedAt: null,
    isCurrent: true,
    ...(query
      ? {
          OR: [
            { member: { displayName: { contains: query, mode: "insensitive" } } },
            {
              member: {
                membershipNumber: { contains: query, mode: "insensitive" },
              },
            },
            { position: { title: { contains: query, mode: "insensitive" } } },
            { position: { code: { contains: query, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [total, rows] = await prisma.$transaction([
    prisma.committeeAssignment.count({ where }),
    prisma.committeeAssignment.findMany({
      where,
      include: {
        member: {
          select: {
            id: true,
            displayName: true,
            membershipNumber: true,
            status: true,
          },
        },
        position: { select: { code: true, title: true, active: true } },
      },
      orderBy: [{ position: { sortOrder: "asc" } }, { startsOn: "desc" }],
      skip,
      take: pageSize,
    }),
  ]);

  return {
    total,
    page,
    pageSize,
    items: rows.map((row) => ({
      id: row.id,
      memberId: row.member.id,
      memberName: row.member.displayName,
      membershipNumber: row.member.membershipNumber,
      memberStatus: row.member.status,
      positionCode: row.position.code,
      positionTitle: row.position.title,
      positionActive: row.position.active,
      startsOn: row.startsOn.toISOString().slice(0, 10),
    })),
  };
}

export async function searchAdminUsers(input: {
  query?: string;
  role?: string;
  active?: string;
  page?: number;
  pageSize?: number;
}) {
  const { page, pageSize, skip } = clampPage(input.page ?? 1, input.pageSize ?? 20);
  const query = input.query?.trim();
  const where: Prisma.UserWhereInput = {
    deletedAt: null,
    ...(input.role ? { role: input.role as AppRole } : {}),
    ...(input.active === "true"
      ? { active: true }
      : input.active === "false"
        ? { active: false }
        : {}),
    ...(query
      ? {
          OR: [
            { email: { contains: query, mode: "insensitive" } },
            { name: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, rows] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
        member: { select: { id: true, membershipNumber: true } },
      },
    }),
  ]);

  return {
    total,
    page,
    pageSize,
    items: rows.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as AppRole,
      roleLabel: formatRoleLabel(user.role as AppRole),
      active: user.active,
      createdAt: user.createdAt.toISOString(),
      memberId: user.member?.id ?? null,
      membershipNumber: user.member?.membershipNumber ?? null,
    })),
  };
}

/** Pure CSV builder — always routes cells through formula neutralization. */
export function buildAdminPaymentsCsv(
  items: Array<{
    id: string;
    memberName: string;
    membershipNumber: string;
    amountLabel: string;
    status: string;
    method: string;
    paidAt: string | null;
    createdAt: string;
    receiptNumber: string | null;
    invoiceNumber: string | null;
    providerPaymentRef: string | null;
  }>,
): string {
  const headers = [
    "id",
    "member",
    "membershipNumber",
    "amount",
    "status",
    "method",
    "paidAt",
    "createdAt",
    "receipt",
    "invoice",
    "providerPaymentRef",
  ];
  return [
    toCsvLine(headers),
    ...items.map((row) =>
      toCsvLine([
        row.id,
        row.memberName,
        row.membershipNumber,
        row.amountLabel,
        row.status,
        row.method,
        row.paidAt ?? "",
        row.createdAt,
        row.receiptNumber ?? "",
        row.invoiceNumber ?? "",
        row.providerPaymentRef ?? "",
      ]),
    ),
  ].join("\n");
}

export async function exportAdminPaymentsCsv(input: {
  query?: string;
  status?: string;
  memberId?: string;
  from?: Date;
  to?: Date;
}) {
  const result = await searchAdminPayments({
    ...input,
    page: 1,
    pageSize: 500,
  });
  return buildAdminPaymentsCsv(result.items);
}

/** Pure CSV builder — always routes cells through formula neutralization. */
export function buildAdminMandatesCsv(
  items: Array<{
    id: string;
    memberName: string;
    membershipNumber: string;
    status: string;
    amountLabel: string;
    provider: string | null;
    providerMandateRef: string | null;
    nextDebitAt: string | null;
    lastStatusAt: string | null;
  }>,
): string {
  const headers = [
    "id",
    "member",
    "membershipNumber",
    "status",
    "amount",
    "provider",
    "providerMandateRef",
    "nextDebitAt",
    "lastStatusAt",
  ];
  return [
    toCsvLine(headers),
    ...items.map((row) =>
      toCsvLine([
        row.id,
        row.memberName,
        row.membershipNumber,
        row.status,
        row.amountLabel,
        row.provider ?? "",
        row.providerMandateRef ?? "",
        row.nextDebitAt ?? "",
        row.lastStatusAt ?? "",
      ]),
    ),
  ].join("\n");
}

export async function exportAdminMandatesCsv(input: {
  query?: string;
  status?: string;
  memberId?: string;
  from?: Date;
  to?: Date;
}) {
  const result = await searchAdminMandates({
    ...input,
    page: 1,
    pageSize: 500,
  });
  return buildAdminMandatesCsv(result.items);
}

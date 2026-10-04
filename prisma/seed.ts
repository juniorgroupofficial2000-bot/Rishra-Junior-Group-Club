/**
 * SAMPLE / FICTIONAL seed data only — local and controlled sandboxes.
 * Never seed real member personal information.
 * Never copy production member dumps into development.
 *
 * Public pages do not read this file at runtime. They load published Prisma rows
 * via `server/content/public-loaders.ts`. SAMPLE rows stay hidden unless
 * CONTENT_INCLUDE_SAMPLE=true (forbidden in production).
 */
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { resolveAppEnv } from "../config/app-env";
import {
  looksLikeLocalDatabaseUrl,
  mergeProductionMarkers,
} from "../config/isolation";
import { assertDestructiveOpAllowed } from "../config/destructive-ops";
import { allowFinancialHardDelete } from "../server/db/financial-mutation";

const prisma = new PrismaClient();

/** Callable from CLI and non-production developer utilities. */
export async function runDemoSeed() {
  const appEnv = resolveAppEnv(process.env);
  if (appEnv === "production") {
    throw new Error(
      "Refusing to seed when APP_ENV=production — use a non-production database.",
    );
  }

  const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
  const markers = mergeProductionMarkers(process.env.PRODUCTION_RESOURCE_MARKERS);
  if (markers.some((m) => databaseUrl.toLowerCase().includes(m))) {
    throw new Error(
      "Refusing to seed: DATABASE_URL matches production resource markers.",
    );
  }

  if (
    appEnv === "local" &&
    databaseUrl &&
    !looksLikeLocalDatabaseUrl(databaseUrl) &&
    process.env.ALLOW_REMOTE_LOCAL_DATABASE !== "true"
  ) {
    throw new Error(
      "Refusing to seed a non-local DATABASE_URL when APP_ENV=local.",
    );
  }

  assertDestructiveOpAllowed("database_seed_wipe");

  console.log("Seeding SAMPLE / fictional data…");
  console.warn(
    "Demo accounts use fictional @rjgc.local addresses for local/sandbox only. Passwords are not logged.",
  );

  // Seed teardown may hard-delete SAMPLE rows; production app never enables this.
  await allowFinancialHardDelete(prisma);

  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.eventAttendance.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.galleryMedia.deleteMany();
  await prisma.galleryAlbum.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.publicCommitteeMember.deleteMany();
  await prisma.event.updateMany({ data: { coverAssetId: null } });
  await prisma.pujaYear.updateMany({ data: { coverAssetId: null } });
  await prisma.mediaAsset.deleteMany();
  await prisma.faqItem.deleteMany();
  await prisma.timelineEntry.deleteMany();
  await prisma.pujaYear.deleteMany();
  await prisma.siteContentBlock.deleteMany();
  await prisma.providerWebhookEvent.deleteMany({ where: { provider: "mock" } });
  await prisma.receipt.deleteMany();
  await prisma.paymentAttempt.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.paymentMandate.deleteMany();
  await prisma.committeeAssignment.deleteMany();
  await prisma.committeePosition.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.membershipPlan.deleteMany();
  await prisma.event.deleteMany();
  await prisma.member.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await hash("MemberDemo1!", 12);
  const adminHash = await hash("AdminDemo1!", 12);

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@rjgc.local",
      name: "[SAMPLE] Platform Admin",
      passwordHash: adminHash,
      role: "SUPER_ADMIN",
      active: true,
      emailVerifiedAt: new Date(),
    },
  });

  const memberUser = await prisma.user.create({
    data: {
      email: "member@rjgc.local",
      name: "[SAMPLE] Demo Member",
      passwordHash,
      role: "MEMBER",
      active: true,
      emailVerifiedAt: new Date(),
      createdById: adminUser.id,
    },
  });

  const plan = await prisma.membershipPlan.create({
    data: {
      code: "SAMPLE_REGULAR",
      name: "[SAMPLE] Regular membership",
      description: "Fictional plan for local development only.",
      billingCycle: "MONTHLY",
      // Fictional sandbox amount only (₹500) — not a live dues quote.
      amountPaise: 50000,
      currency: "INR",
      active: true,
      isSample: true,
    },
  });

  const member = await prisma.member.create({
    data: {
      userId: memberUser.id,
      membershipNumber: "RJGC-SAMPLE-001",
      firstName: "Demo",
      lastName: "Member",
      displayName: "[SAMPLE] Demo Member",
      email: "member@rjgc.local",
      phone: "+910000000001",
      status: "ACTIVE",
      joinedOn: new Date("2024-01-15"),
      addressLine1: "[SAMPLE] Example Street",
      city: "Rishra",
      state: "West Bengal",
      postalCode: "712248",
      country: "IN",
      internalNotes: "FICTIONAL seed record — not a real person.",
      isSample: true,
      createdById: adminUser.id,
      updatedById: adminUser.id,
    },
  });

  const secondMember = await prisma.member.create({
    data: {
      membershipNumber: "RJGC-SAMPLE-002",
      firstName: "Asha",
      lastName: "Example",
      displayName: "[SAMPLE] Asha Example",
      email: "asha.example@rjgc.local",
      phone: "+910000000002",
      status: "PENDING",
      joinedOn: new Date("2025-06-01"),
      city: "Rishra",
      state: "West Bengal",
      country: "IN",
      internalNotes: "FICTIONAL seed record — not a real person.",
      isSample: true,
      createdById: adminUser.id,
      updatedById: adminUser.id,
    },
  });

  await prisma.membership.create({
    data: {
      memberId: member.id,
      planId: plan.id,
      status: "ACTIVE",
      isCurrent: true,
      startsOn: new Date("2024-01-15"),
      nextDueOn: new Date("2026-04-01"),
      isSample: true,
      createdById: adminUser.id,
      updatedById: adminUser.id,
    },
  });

  await prisma.membership.create({
    data: {
      memberId: secondMember.id,
      planId: plan.id,
      status: "PENDING",
      isCurrent: true,
      startsOn: new Date("2025-06-01"),
      isSample: true,
      createdById: adminUser.id,
    },
  });

  const president = await prisma.committeePosition.create({
    data: {
      code: "PRESIDENT",
      title: "President",
      sortOrder: 1,
      active: true,
    },
  });

  await prisma.committeeAssignment.create({
    data: {
      memberId: member.id,
      positionId: president.id,
      startsOn: new Date("2025-01-01"),
      isCurrent: true,
      isSample: true,
      createdById: adminUser.id,
    },
  });

  const invoice = await prisma.invoice.create({
    data: {
      memberId: member.id,
      number: "INV-SAMPLE-001",
      amountPaise: 50000,
      currency: "INR",
      // Seed never invents a paid/settled financial state for reconciliation demos.
      status: "ISSUED",
      issuedOn: new Date("2025-11-01"),
      dueOn: new Date("2025-11-10"),
      notes: "[SAMPLE] Invoice placeholder — not a live dues quote.",
      isSample: true,
      createdById: adminUser.id,
    },
  });

  const payment = await prisma.payment.create({
    data: {
      memberId: member.id,
      invoiceId: invoice.id,
      amountPaise: 50000,
      currency: "INR",
      // SUCCESS only via verified webhooks in application code — seed stays PENDING.
      status: "PENDING",
      method: "BANK_TRANSFER",
      paidAt: null,
      provider: "mock",
      providerPaymentRef: "pay_sample_seed_001",
      notes:
        "[SAMPLE] Sandbox payment row awaiting verified webhook — not claimed successful.",
      isSample: true,
      createdById: adminUser.id,
    },
  });

  await prisma.paymentAttempt.create({
    data: {
      paymentId: payment.id,
      status: "STARTED",
      provider: "mock",
      providerAttemptRef: "pay_sample_seed_001",
      attemptedAt: new Date("2025-11-01"),
    },
  });

  await prisma.paymentMandate.create({
    data: {
      memberId: member.id,
      status: "CREATED",
      provider: "mock",
      providerMandateRef: null,
      amountPaise: 50000,
      currency: "INR",
      note: "[SAMPLE] E-mandate not configured. Credentials are never stored.",
      isSample: true,
    },
  });

  const event = await prisma.event.create({
    data: {
      slug: "sample-saraswati-puja-gathering",
      title: "[SAMPLE] Saraswati Puja gathering",
      description: "Fictional upcoming event for portal demos.",
      startsAt: new Date("2026-02-01T09:00:00+05:30"),
      endsAt: new Date("2026-02-01T18:00:00+05:30"),
      venueLabel: "Club premises, Rishra",
      status: "SCHEDULED",
      published: true,
      isSample: true,
      createdById: adminUser.id,
    },
  });

  await prisma.eventRegistration.create({
    data: {
      eventId: event.id,
      memberId: member.id,
      status: "REGISTERED",
    },
  });

  await prisma.eventAttendance.create({
    data: {
      eventId: event.id,
      memberId: member.id,
      status: "REGISTERED",
      recordedById: adminUser.id,
    },
  });

  await prisma.announcement.create({
    data: {
      slug: "sample-welcome-to-the-digital-platform",
      title: "[SAMPLE] Welcome to the digital platform",
      body: "This is fictional announcement copy for local development.",
      status: "PUBLISHED",
      pinned: true,
      publishedAt: new Date("2026-01-15"),
      isSample: true,
      createdById: adminUser.id,
    },
  });

  const album = await prisma.galleryAlbum.create({
    data: {
      slug: "sample-seed-album",
      title: "[SAMPLE] Seed album",
      description: "Fictional gallery album for schema verification.",
      published: false,
      isSample: true,
      createdById: adminUser.id,
    },
  });

  await prisma.galleryMedia.create({
    data: {
      albumId: album.id,
      type: "IMAGE",
      url: "/placeholders/gallery-sample.jpg",
      caption: "[SAMPLE] Placeholder media",
      sortOrder: 1,
      isSample: true,
    },
  });

  await prisma.notification.create({
    data: {
      userId: memberUser.id,
      type: "SYSTEM",
      title: "[SAMPLE] Portal ready",
      body: "Fictional notification for the demo member account.",
      isSample: true,
    },
  });

  const { seedPublicCmsContent } = await import("./seed-cms-content");
  await seedPublicCmsContent(prisma, adminUser.id);

  await prisma.auditLog.create({
    data: {
      actorUserId: adminUser.id,
      action: "seed.completed",
      entityType: "System",
      entityId: null,
      metadata: {
        note: "SAMPLE seed only — no real personal data",
        members: [member.membershipNumber, secondMember.membershipNumber],
        cms: true,
      },
    },
  });

  console.log("Seed complete.");
  console.log("  Demo logins: member@rjgc.local and admin@rjgc.local (passwords not printed).");
  console.log("  All records are marked SAMPLE / fictional.");
}

const isCli =
  typeof process.argv[1] === "string" &&
  /(^|[\\/])seed\.(ts|js|mjs|cjs)$/.test(process.argv[1]);

if (isCli) {
  runDemoSeed()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

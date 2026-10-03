import "server-only";

import { assertDestructiveOpAllowed } from "@/config/destructive-ops";
import { prisma } from "@/server/db/prisma";
import { isDeveloperUtilitiesEnabled } from "@/server/dev/guard";
import {
  getNotificationService,
  resolveMemberRecipient,
} from "@/server/notifications/service";
import { NotificationEvents } from "@/server/notifications/types";
import { getPaymentProvider } from "@/server/payments/factory";
import { processProviderWebhook } from "@/server/payments/webhook-processor";
import { MockPaymentProvider } from "@/server/payments/mock-provider";

export type DeveloperUtilityAction =
  | "seed"
  | "reset"
  | "create-test-member"
  | "create-test-event"
  | "create-test-announcement"
  | "test-notification"
  | "test-payment-webhook";

export type DeveloperUtilityResult = {
  ok: true;
  action: DeveloperUtilityAction;
  message: string;
  details?: Record<string, string | number | boolean | null>;
};

function assertEnabled(): void {
  if (!isDeveloperUtilitiesEnabled()) {
    throw new Error("Developer utilities are unavailable.");
  }
}

function sampleSlug(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}`;
}

export async function runDeveloperUtility(
  action: DeveloperUtilityAction,
  actorUserId: string | null,
): Promise<DeveloperUtilityResult> {
  assertEnabled();

  switch (action) {
    case "seed":
      return seedDatabase();
    case "reset":
      return resetDevelopmentDatabase();
    case "create-test-member":
      return createTestMember(actorUserId);
    case "create-test-event":
      return createTestEvent(actorUserId);
    case "create-test-announcement":
      return createTestAnnouncement(actorUserId);
    case "test-notification":
      return sendTestNotification(actorUserId);
    case "test-payment-webhook":
      return testPaymentWebhook(actorUserId);
    default:
      throw new Error("Unknown developer utility.");
  }
}

async function seedDatabase(): Promise<DeveloperUtilityResult> {
  assertDestructiveOpAllowed("database_seed_wipe");
  const { runDemoSeed } = await import("../../prisma/seed");
  await runDemoSeed();
  return {
    ok: true,
    action: "seed",
    message: "SAMPLE seed completed. Demo accounts use @rjgc.local addresses.",
  };
}

async function resetDevelopmentDatabase(): Promise<DeveloperUtilityResult> {
  assertDestructiveOpAllowed("database_reset");
  const { runDemoSeed } = await import("../../prisma/seed");
  await runDemoSeed();
  return {
    ok: true,
    action: "reset",
    message:
      "Development data reset via SAMPLE wipe + re-seed (not prisma migrate reset).",
  };
}

async function createTestMember(
  actorUserId: string | null,
): Promise<DeveloperUtilityResult> {
  const suffix = Date.now().toString(36).slice(-6).toUpperCase();
  const member = await prisma.member.create({
    data: {
      membershipNumber: `RJGC-DEV-${suffix}`,
      firstName: "Test",
      lastName: "Member",
      displayName: `[SAMPLE] Test Member ${suffix}`,
      email: `test.member.${suffix.toLowerCase()}@rjgc.local`,
      phone: "+910000000099",
      status: "ACTIVE",
      joinedOn: new Date(),
      city: "Rishra",
      state: "West Bengal",
      country: "IN",
      internalNotes: "Created by developer utility — fictional SAMPLE row.",
      isSample: true,
      createdById: actorUserId,
      updatedById: actorUserId,
    },
  });

  return {
    ok: true,
    action: "create-test-member",
    message: "Created SAMPLE test member.",
    details: {
      memberId: member.id,
      membershipNumber: member.membershipNumber,
      email: member.email,
    },
  };
}

async function createTestEvent(
  actorUserId: string | null,
): Promise<DeveloperUtilityResult> {
  const slug = sampleSlug("dev-event");
  const startsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const event = await prisma.event.create({
    data: {
      slug,
      title: `[SAMPLE] Developer test event`,
      description: "Fictional event created by developer utilities.",
      startsAt,
      endsAt: new Date(startsAt.getTime() + 2 * 60 * 60 * 1000),
      venueLabel: "Club premises (sample)",
      category: "event",
      status: "SCHEDULED",
      published: true,
      contentStatus: "PUBLISHED",
      registrationRequired: true,
      isSample: true,
      createdById: actorUserId,
      updatedById: actorUserId,
    },
  });

  return {
    ok: true,
    action: "create-test-event",
    message: "Created SAMPLE test event.",
    details: { eventId: event.id, slug: event.slug },
  };
}

async function createTestAnnouncement(
  actorUserId: string | null,
): Promise<DeveloperUtilityResult> {
  const slug = sampleSlug("dev-announcement");
  const row = await prisma.announcement.create({
    data: {
      slug,
      title: "[SAMPLE] Developer test announcement",
      summary: "Fictional announcement from developer utilities.",
      body: "This SAMPLE announcement was created for local/staging testing only.",
      status: "PUBLISHED",
      priority: "NORMAL",
      category: "general",
      publishedAt: new Date(),
      isSample: true,
      createdById: actorUserId,
    },
  });

  return {
    ok: true,
    action: "create-test-announcement",
    message: "Created SAMPLE test announcement.",
    details: { announcementId: row.id, slug: row.slug },
  };
}

async function sendTestNotification(
  actorUserId: string | null,
): Promise<DeveloperUtilityResult> {
  if (!actorUserId) {
    throw new Error("Signed-in admin user required for test notification.");
  }

  const member = await prisma.member.findFirst({
    where: { deletedAt: null, userId: { not: null } },
    orderBy: { createdAt: "desc" },
  });

  const fromMember = member
    ? await resolveMemberRecipient(member.id)
    : null;
  const recipient = fromMember ?? {
    userId: actorUserId,
    email: null as string | null,
    phone: null as string | null,
    displayName: "Developer",
  };

  const results = await getNotificationService().notifyEvent({
    event: NotificationEvents.ANNOUNCEMENT_PUBLISHED,
    recipient,
    data: {
      announcementTitle: "[SAMPLE] Developer test notification",
    },
    channels: ["in_app", "email"],
  });

  return {
    ok: true,
    action: "test-notification",
    message: "Dispatched test notification (console/email per lane policy).",
    details: {
      channels: results.length,
      okCount: results.filter((r) => r.ok).length,
    },
  };
}

async function testPaymentWebhook(
  actorUserId: string | null,
): Promise<DeveloperUtilityResult> {
  let member = await prisma.member.findFirst({
    where: { deletedAt: null, isSample: true, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });
  if (!member) {
    const created = await createTestMember(actorUserId);
    member = await prisma.member.findUniqueOrThrow({
      where: { id: String(created.details?.memberId) },
    });
  }

  const provider = getPaymentProvider();
  if (!(provider instanceof MockPaymentProvider)) {
    throw new Error(
      "Test payment webhook requires PAYMENT_PROVIDER=mock in this environment.",
    );
  }

  const remote = await provider.createPayment({
    amountPaise: 50000,
    memberId: member.id,
  });

  const payment = await prisma.payment.create({
    data: {
      memberId: member.id,
      amountPaise: 50000,
      currency: "INR",
      status: "PENDING",
      method: "UPI",
      provider: "mock",
      providerPaymentRef: remote.providerPaymentRef,
      notes: "Developer utility SAMPLE payment",
      isSample: true,
      createdById: actorUserId,
    },
  });

  const signed = provider.signWebhook({
    id: `evt_dev_${Date.now()}`,
    event: "payment.captured",
    payload: {
      paymentRef: remote.providerPaymentRef,
      paymentStatus: "SUCCESS",
      amountPaise: 50000,
    },
  });

  const result = await processProviderWebhook({
    prisma,
    provider,
    rawBody: signed.rawBody,
    signatureHeader: signed.signatureHeader,
  });

  const updated = await prisma.payment.findUniqueOrThrow({
    where: { id: payment.id },
  });

  return {
    ok: true,
    action: "test-payment-webhook",
    message: "Processed mock payment.captured webhook for SAMPLE payment.",
    details: {
      paymentId: payment.id,
      status: updated.status,
      webhookStatus: result.status,
    },
  };
}

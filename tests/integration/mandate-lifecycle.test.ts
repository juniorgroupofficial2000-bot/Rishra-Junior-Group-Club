import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { allowFinancialHardDelete } from "@/server/db/financial-mutation";
import { setPaymentProviderForTests } from "@/server/payments/factory";
import { MockPaymentProvider } from "@/server/payments/mock-provider";
import {
  cancelMemberMandate,
  PaymentServiceError,
  setupMemberMandate,
} from "@/server/payments/mandate-service";
import { processProviderWebhook } from "@/server/payments/webhook-processor";

const prisma = new PrismaClient();
const suffix = `man${Date.now().toString(36)}`;

describe("mandate lifecycle integration", () => {
  let memberId: string;
  let planId: string;
  let actorUserId: string;
  let provider: MockPaymentProvider;

  beforeAll(async () => {
    process.env.PAYMENT_PROVIDER = "mock";
    process.env.PAYMENT_WEBHOOK_SECRET = "test-secret";
    const user = await prisma.user.create({
      data: {
        email: `mandate.actor.${suffix}@rjgc.local`,
        name: "Mandate Actor",
        passwordHash: "x",
        role: "TREASURER",
        active: true,
      },
    });
    actorUserId = user.id;
    const plan = await prisma.membershipPlan.create({
      data: {
        code: `MPLAN-${suffix}`,
        name: `[SAMPLE] Mandate Plan ${suffix}`,
        billingCycle: "MONTHLY",
        amountPaise: 50000,
        currency: "INR",
        active: true,
        isSample: true,
      },
    });
    planId = plan.id;
    const member = await prisma.member.create({
      data: {
        membershipNumber: `RJGC-MAN-${suffix}`,
        firstName: "Man",
        lastName: "Date",
        displayName: `[SAMPLE] Mandate ${suffix}`,
        email: `mandate.${suffix}@rjgc.local`,
        status: "ACTIVE",
        isSample: true,
      },
    });
    memberId = member.id;
    await prisma.membership.create({
      data: {
        memberId,
        planId,
        status: "ACTIVE",
        isCurrent: true,
        isSample: true,
      },
    });
  });

  beforeEach(async () => {
    provider = new MockPaymentProvider({ webhookSecret: "test-secret" });
    setPaymentProviderForTests(provider);
    await prisma.paymentMandate.updateMany({
      where: {
        memberId,
        deletedAt: null,
        status: { in: ["CREATED", "PENDING", "ACTIVE", "PAUSED"] },
      },
      data: { status: "CANCELLED", lastStatusAt: new Date() },
    });
  });

  afterAll(async () => {
    setPaymentProviderForTests(null);
    await allowFinancialHardDelete(prisma);
    await prisma.providerWebhookEvent.deleteMany({
      where: { provider: "mock", providerEventId: { contains: suffix } },
    });
    await prisma.paymentMandate.deleteMany({ where: { memberId } });
    await prisma.membership.deleteMany({ where: { memberId } });
    await prisma.member.delete({ where: { id: memberId } });
    await prisma.membershipPlan.delete({ where: { id: planId } });
    await prisma.user.update({
      where: { id: actorUserId },
      data: { active: false, email: `deleted.mandate.${suffix}@rjgc.local` },
    });
    await prisma.$disconnect();
  });

  it("sets up a mandate as PENDING (never ACTIVE without webhook)", async () => {
    const setup = await setupMemberMandate({
      memberId,
      actorUserId,
    });
    expect(["CREATED", "PENDING"]).toContain(setup.status);
    expect(setup.status).not.toBe("ACTIVE");

    const row = await prisma.paymentMandate.findUniqueOrThrow({
      where: { id: setup.mandateId },
    });
    expect(row.amountPaise).toBe(50000);
  });

  it("rejects a second open mandate for the same member", async () => {
    await setupMemberMandate({ memberId, actorUserId });
    await expect(
      setupMemberMandate({ memberId, actorUserId }),
    ).rejects.toMatchObject({ code: "INVALID_STATE" });
  });

  it("rejects setup when no current plan exists", async () => {
    await prisma.membership.updateMany({
      where: { memberId },
      data: { isCurrent: false },
    });
    await expect(
      setupMemberMandate({ memberId, actorUserId }),
    ).rejects.toBeInstanceOf(PaymentServiceError);
    await prisma.membership.updateMany({
      where: { memberId },
      data: { isCurrent: true },
    });
  });

  it("activates via verified webhook then cancels", async () => {
    const setup = await setupMemberMandate({ memberId, actorUserId });
    const mandate = await prisma.paymentMandate.findUniqueOrThrow({
      where: { id: setup.mandateId },
    });

    const signed = provider.signWebhook({
      id: `evt_man_active_${suffix}`,
      event: "subscription.activated",
      payload: {
        mandateRef: mandate.providerMandateRef!,
        mandateStatus: "ACTIVE",
      },
    });
    const processed = await processProviderWebhook({
      prisma,
      provider,
      rawBody: signed.rawBody,
      signatureHeader: signed.signatureHeader,
    });
    expect(processed.status).toBe("processed");

    const active = await prisma.paymentMandate.findUniqueOrThrow({
      where: { id: setup.mandateId },
    });
    expect(active.status).toBe("ACTIVE");

    const cancelled = await cancelMemberMandate({
      memberId,
      actorUserId,
    });
    expect(cancelled.status).toBe("CANCELLED");
  });
});

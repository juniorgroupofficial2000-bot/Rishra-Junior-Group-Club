import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { allowFinancialHardDelete } from "@/server/db/financial-mutation";
import { MockPaymentProvider } from "@/server/payments/mock-provider";
import { setPaymentProviderForTests } from "@/server/payments/factory";
import { PaymentServiceError } from "@/server/payments/mandate-service";
import {
  initiateMemberPayment,
  requestPaymentRefund,
} from "@/server/payments/payment-service";

const prisma = new PrismaClient();
const suffix = `pay${Date.now().toString(36)}`;

describe("payment initiation + refund rules", () => {
  let memberId: string;
  let planId: string;
  let provider: MockPaymentProvider;

  beforeAll(async () => {
    process.env.PAYMENT_PROVIDER = "mock";
    process.env.PAYMENT_WEBHOOK_SECRET = "test-secret";
    const plan = await prisma.membershipPlan.create({
      data: {
        code: `PLAN-${suffix}`,
        name: `[SAMPLE] Plan ${suffix}`,
        billingCycle: "YEARLY",
        amountPaise: 120000,
        currency: "INR",
        active: true,
        isSample: true,
      },
    });
    planId = plan.id;
    const member = await prisma.member.create({
      data: {
        membershipNumber: `RJGC-PAY-${suffix}`,
        firstName: "Pay",
        lastName: "Test",
        displayName: `[SAMPLE] Pay ${suffix}`,
        email: `pay.${suffix}@rjgc.local`,
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

  beforeEach(() => {
    provider = new MockPaymentProvider({ webhookSecret: "test-secret" });
    setPaymentProviderForTests(provider);
  });

  afterAll(async () => {
    setPaymentProviderForTests(null);
    await allowFinancialHardDelete(prisma);
    await prisma.paymentAttempt.deleteMany({
      where: { payment: { memberId } },
    });
    await prisma.receipt.deleteMany({ where: { payment: { memberId } } });
    await prisma.payment.deleteMany({ where: { memberId } });
    await prisma.invoice.deleteMany({ where: { memberId } });
    await prisma.membership.deleteMany({ where: { memberId } });
    await prisma.member.delete({ where: { id: memberId } });
    await prisma.membershipPlan.delete({ where: { id: planId } });
    await prisma.$disconnect();
  });

  it("uses plan amount and rejects mismatched client amounts", async () => {
    await expect(
      initiateMemberPayment({
        memberId,
        amountPaise: 999,
      }),
    ).rejects.toMatchObject({ code: "INVALID_STATE" });

    const payment = await initiateMemberPayment({ memberId });
    expect(payment.amountPaise).toBe(120000);
    expect(payment.status).toBe("PENDING");
  });

  it("rejects unknown members", async () => {
    await expect(
      initiateMemberPayment({ memberId: "missing", amountPaise: 100 }),
    ).rejects.toBeInstanceOf(PaymentServiceError);
  });

  it("caps refunds to the original payment amount", async () => {
    const payment = await initiateMemberPayment({ memberId });
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "SUCCESS",
        paidAt: new Date(),
        providerPaymentRef: payment.providerPaymentRef ?? `ref_${suffix}`,
      },
    });

    await expect(
      requestPaymentRefund({
        paymentId: payment.id,
        actorUserId: "actor",
        amountPaise: payment.amountPaise + 1,
      }),
    ).rejects.toMatchObject({ code: "INVALID_AMOUNT" });

    await expect(
      requestPaymentRefund({
        paymentId: payment.id,
        actorUserId: "actor",
        amountPaise: 0,
      }),
    ).rejects.toMatchObject({ code: "INVALID_AMOUNT" });
  });
});

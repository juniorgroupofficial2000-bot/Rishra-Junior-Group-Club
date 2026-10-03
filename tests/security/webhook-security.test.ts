import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { allowFinancialHardDelete } from "@/server/db/financial-mutation";
import { MockPaymentProvider } from "@/server/payments/mock-provider";
import {
  processProviderWebhook,
  WebhookSignatureError,
} from "@/server/payments/webhook-processor";

const prisma = new PrismaClient();
const suffix = `whsec${Date.now().toString(36)}`;

describe("security: invalid and replayed webhooks", () => {
  let memberId: string;
  let provider: MockPaymentProvider;
  let paymentRef: string;

  beforeAll(async () => {
    const member = await prisma.member.create({
      data: {
        membershipNumber: `RJGC-WHSEC-${suffix}`,
        firstName: "Wh",
        lastName: "Sec",
        displayName: `[SAMPLE] WhSec ${suffix}`,
        email: `whsec.${suffix}@rjgc.local`,
        status: "ACTIVE",
        isSample: true,
      },
    });
    memberId = member.id;
  });

  beforeEach(async () => {
    provider = new MockPaymentProvider({ webhookSecret: "whsec-secret" });
    const remote = await provider.createPayment({
      amountPaise: 2500,
      memberId,
    });
    paymentRef = remote.providerPaymentRef ?? `mock_pay_${Date.now()}`;
    await prisma.payment.create({
      data: {
        memberId,
        amountPaise: 2500,
        status: "PENDING",
        method: "OTHER",
        provider: "mock",
        providerPaymentRef: paymentRef,
        isSample: true,
      },
    });
  });

  afterAll(async () => {
    await allowFinancialHardDelete(prisma);
    await prisma.providerWebhookEvent.deleteMany({
      where: { providerEventId: { contains: suffix } },
    });
    await prisma.paymentAttempt.deleteMany({
      where: { payment: { memberId } },
    });
    await prisma.receipt.deleteMany({ where: { payment: { memberId } } });
    await prisma.payment.deleteMany({ where: { memberId } });
    await prisma.invoice.deleteMany({ where: { memberId } });
    await prisma.member.delete({ where: { id: memberId } });
    await prisma.$disconnect();
  });

  it("rejects forged signatures (invalid webhook)", async () => {
    const signed = provider.signWebhook({
      id: `evt_forged_${suffix}`,
      event: "payment.captured",
      payload: {
        paymentRef,
        paymentStatus: "SUCCESS",
        amountPaise: 2500,
      },
    });

    await expect(
      processProviderWebhook({
        prisma,
        provider,
        rawBody: signed.rawBody,
        signatureHeader: "deadbeef",
      }),
    ).rejects.toBeInstanceOf(WebhookSignatureError);

    const payment = await prisma.payment.findFirstOrThrow({
      where: { providerPaymentRef: paymentRef },
    });
    expect(payment.status).toBe("PENDING");
  });

  it("is idempotent on replayed webhook events", async () => {
    const signed = provider.signWebhook({
      id: `evt_replay_${suffix}`,
      event: "payment.captured",
      payload: {
        paymentRef,
        paymentStatus: "SUCCESS",
        amountPaise: 2500,
      },
    });

    const first = await processProviderWebhook({
      prisma,
      provider,
      rawBody: signed.rawBody,
      signatureHeader: signed.signatureHeader,
    });
    expect(first.status).toBe("processed");

    const second = await processProviderWebhook({
      prisma,
      provider,
      rawBody: signed.rawBody,
      signatureHeader: signed.signatureHeader,
    });
    expect(second.status).toBe("duplicate");

    const payment = await prisma.payment.findFirstOrThrow({
      where: { providerPaymentRef: paymentRef },
    });
    expect(payment.status).toBe("SUCCESS");
  });

  it("does not mark SUCCESS on amount mismatch even with valid signature", async () => {
    const signed = provider.signWebhook({
      id: `evt_amt_${suffix}`,
      event: "payment.captured",
      payload: {
        paymentRef,
        paymentStatus: "SUCCESS",
        amountPaise: 999999,
      },
    });

    const result = await processProviderWebhook({
      prisma,
      provider,
      rawBody: signed.rawBody,
      signatureHeader: signed.signatureHeader,
    });
    expect(result.status).toBe("failed");
    if (result.status === "failed") {
      expect(result.retryable).toBe(false);
    }

    const payment = await prisma.payment.findFirstOrThrow({
      where: { providerPaymentRef: paymentRef },
    });
    expect(payment.status).toBe("PENDING");
  });
});

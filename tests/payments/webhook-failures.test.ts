import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { allowFinancialHardDelete } from "@/server/db/financial-mutation";
import { MockPaymentProvider } from "@/server/payments/mock-provider";
import {
  nextPaymentStatus,
  processProviderWebhook,
} from "@/server/payments/webhook-processor";

const prisma = new PrismaClient();
const suffix = `wf${Date.now().toString(36)}`;

describe("payment webhook failure scenarios", () => {
  let memberId: string;
  let provider: MockPaymentProvider;

  beforeAll(async () => {
    const member = await prisma.member.create({
      data: {
        membershipNumber: `RJGC-WF-${suffix}`,
        firstName: "Webhook",
        lastName: "Failure",
        displayName: `[SAMPLE] Webhook Failure ${suffix}`,
        email: `wf.${suffix}@rjgc.local`,
        status: "ACTIVE",
        isSample: true,
      },
    });
    memberId = member.id;
  });

  beforeEach(async () => {
    provider = new MockPaymentProvider({ webhookSecret: "fail-secret" });
    await prisma.paymentMandate.updateMany({
      where: {
        memberId,
        status: { in: ["CREATED", "PENDING", "ACTIVE", "PAUSED"] },
      },
      data: { status: "CANCELLED", lastStatusAt: new Date() },
    });
  });

  afterAll(async () => {
    await allowFinancialHardDelete(prisma);
    await prisma.providerWebhookEvent.deleteMany({
      where: { providerEventId: { contains: suffix } },
    });
    await prisma.receipt.deleteMany({ where: { payment: { memberId } } });
    await prisma.paymentAttempt.deleteMany({
      where: { payment: { memberId } },
    });
    await prisma.payment.deleteMany({ where: { memberId } });
    await prisma.invoice.deleteMany({ where: { memberId } });
    await prisma.paymentMandate.deleteMany({ where: { memberId } });
    await prisma.member.delete({ where: { id: memberId } });
    await prisma.$disconnect();
  });

  it("rejects amount mismatch as non-retryable and leaves payment PENDING", async () => {
    const remote = await provider.createPayment({
      amountPaise: 10000,
      memberId,
    });
    const payment = await prisma.payment.create({
      data: {
        memberId,
        amountPaise: 10000,
        status: "PENDING",
        method: "MANDATE",
        provider: "mock",
        providerPaymentRef: remote.providerPaymentRef,
      },
    });

    const signed = provider.signWebhook({
      id: `evt_amt_${suffix}`,
      event: "payment.captured",
      payload: {
        paymentRef: remote.providerPaymentRef,
        paymentStatus: "SUCCESS",
        amountPaise: 99999,
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

    const updated = await prisma.payment.findUniqueOrThrow({
      where: { id: payment.id },
      include: { receipt: true },
    });
    expect(updated.status).toBe("PENDING");
    expect(updated.receipt).toBeNull();
  });

  it("ignores SUCCESS → FAILED regression (monotonic status)", async () => {
    const remote = await provider.createPayment({
      amountPaise: 15000,
      memberId,
    });
    await prisma.payment.create({
      data: {
        memberId,
        amountPaise: 15000,
        status: "PENDING",
        method: "MANDATE",
        provider: "mock",
        providerPaymentRef: remote.providerPaymentRef,
      },
    });

    const success = provider.signWebhook({
      id: `evt_mono_ok_${suffix}`,
      event: "payment.captured",
      payload: {
        paymentRef: remote.providerPaymentRef,
        paymentStatus: "SUCCESS",
        amountPaise: 15000,
      },
    });
    await processProviderWebhook({
      prisma,
      provider,
      rawBody: success.rawBody,
      signatureHeader: success.signatureHeader,
    });

    const fail = provider.signWebhook({
      id: `evt_mono_fail_${suffix}`,
      event: "payment.failed",
      payload: {
        paymentRef: remote.providerPaymentRef,
        paymentStatus: "FAILED",
        failureMessage: "Late failure noise",
      },
    });
    const result = await processProviderWebhook({
      prisma,
      provider,
      rawBody: fail.rawBody,
      signatureHeader: fail.signatureHeader,
    });
    expect(result.status).toBe("processed");

    const payment = await prisma.payment.findFirstOrThrow({
      where: { providerPaymentRef: remote.providerPaymentRef },
    });
    expect(payment.status).toBe("SUCCESS");
    expect(nextPaymentStatus("SUCCESS", "FAILED")).toBeNull();
    expect(nextPaymentStatus("SUCCESS", "REFUNDED")).toBe("REFUNDED");
  });

  it("marks REFUNDED from verified refund webhook only", async () => {
    const remote = await provider.createPayment({
      amountPaise: 18000,
      memberId,
    });
    await prisma.payment.create({
      data: {
        memberId,
        amountPaise: 18000,
        status: "PENDING",
        method: "OTHER",
        provider: "mock",
        providerPaymentRef: remote.providerPaymentRef,
      },
    });

    const captured = provider.signWebhook({
      id: `evt_refund_cap_${suffix}`,
      event: "payment.captured",
      payload: {
        paymentRef: remote.providerPaymentRef,
        paymentStatus: "SUCCESS",
        amountPaise: 18000,
      },
    });
    await processProviderWebhook({
      prisma,
      provider,
      rawBody: captured.rawBody,
      signatureHeader: captured.signatureHeader,
    });

    const refunded = provider.signWebhook({
      id: `evt_refund_${suffix}`,
      event: "payment.refunded",
      payload: {
        paymentRef: remote.providerPaymentRef,
        paymentStatus: "REFUNDED",
        amountPaise: 18000,
      },
    });
    const result = await processProviderWebhook({
      prisma,
      provider,
      rawBody: refunded.rawBody,
      signatureHeader: refunded.signatureHeader,
    });
    expect(result.status).toBe("processed");

    const payment = await prisma.payment.findFirstOrThrow({
      where: { providerPaymentRef: remote.providerPaymentRef },
      include: { receipt: true },
    });
    expect(payment.status).toBe("REFUNDED");
    expect(payment.receipt).not.toBeNull();
  });

  it("links order-ref payments when capture webhook arrives", async () => {
    const orderRef = `order_mock_${suffix}`;
    const paymentRef = `pay_mock_${suffix}`;
    await prisma.payment.create({
      data: {
        memberId,
        amountPaise: 21000,
        status: "PENDING",
        method: "OTHER",
        provider: "mock",
        providerOrderRef: orderRef,
        providerPaymentRef: null,
      },
    });

    // Seed mock provider map so verifyWebhook can update in-memory state.
    provider = new MockPaymentProvider({ webhookSecret: "fail-secret" });
    const signed = provider.signWebhook({
      id: `evt_order_${suffix}`,
      event: "payment.captured",
      payload: {
        paymentRef,
        orderRef,
        paymentStatus: "SUCCESS",
        amountPaise: 21000,
      },
    });

    const result = await processProviderWebhook({
      prisma,
      provider,
      rawBody: signed.rawBody,
      signatureHeader: signed.signatureHeader,
    });
    expect(result.status).toBe("processed");

    const payment = await prisma.payment.findFirstOrThrow({
      where: { providerOrderRef: orderRef },
      include: { receipt: true, invoice: true },
    });
    expect(payment.status).toBe("SUCCESS");
    expect(payment.providerPaymentRef).toBe(paymentRef);
    expect(payment.receipt).not.toBeNull();
  });

  it("rejects recurring debit against a cancelled mandate", async () => {
    const mandate = await prisma.paymentMandate.create({
      data: {
        memberId,
        status: "CANCELLED",
        provider: "mock",
        providerMandateRef: `mandate_closed_${suffix}`,
        amountPaise: 5000,
        isSample: true,
      },
    });

    const signed = provider.signWebhook({
      id: `evt_closed_${suffix}`,
      event: "recurring.debit.failed",
      payload: {
        mandateRef: mandate.providerMandateRef,
        paymentStatus: "FAILED",
        amountPaise: 5000,
        failureMessage: "Should not create",
      },
    });

    const before = await prisma.payment.count({ where: { memberId } });
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
    const after = await prisma.payment.count({ where: { memberId } });
    expect(after).toBe(before);
  });

  it("issues invoice + receipt and marks invoice PAID on SUCCESS", async () => {
    const remote = await provider.createPayment({
      amountPaise: 25000,
      memberId,
    });
    const invoice = await prisma.invoice.create({
      data: {
        memberId,
        number: `INV-WF-${suffix}`,
        amountPaise: 25000,
        status: "ISSUED",
        issuedOn: new Date(),
        dueOn: new Date(),
        isSample: true,
      },
    });
    await prisma.payment.create({
      data: {
        memberId,
        invoiceId: invoice.id,
        amountPaise: 25000,
        status: "PENDING",
        method: "MANDATE",
        provider: "mock",
        providerPaymentRef: remote.providerPaymentRef,
      },
    });

    const signed = provider.signWebhook({
      id: `evt_inv_${suffix}`,
      event: "payment.captured",
      payload: {
        paymentRef: remote.providerPaymentRef,
        paymentStatus: "SUCCESS",
        amountPaise: 25000,
      },
    });
    await processProviderWebhook({
      prisma,
      provider,
      rawBody: signed.rawBody,
      signatureHeader: signed.signatureHeader,
    });

    const paidInvoice = await prisma.invoice.findUniqueOrThrow({
      where: { id: invoice.id },
    });
    expect(paidInvoice.status).toBe("PAID");
  });

  it("does not create a second receipt on duplicate capture events", async () => {
    const remote = await provider.createPayment({
      amountPaise: 27000,
      memberId,
    });
    await prisma.payment.create({
      data: {
        memberId,
        amountPaise: 27000,
        status: "PENDING",
        method: "MANDATE",
        provider: "mock",
        providerPaymentRef: remote.providerPaymentRef,
      },
    });

    const first = provider.signWebhook({
      id: `evt_dup_a_${suffix}`,
      event: "payment.captured",
      payload: {
        paymentRef: remote.providerPaymentRef,
        paymentStatus: "SUCCESS",
        amountPaise: 27000,
      },
    });
    const second = provider.signWebhook({
      id: `evt_dup_b_${suffix}`,
      event: "payment.captured",
      payload: {
        paymentRef: remote.providerPaymentRef,
        paymentStatus: "SUCCESS",
        amountPaise: 27000,
      },
    });

    await processProviderWebhook({
      prisma,
      provider,
      rawBody: first.rawBody,
      signatureHeader: first.signatureHeader,
    });
    await processProviderWebhook({
      prisma,
      provider,
      rawBody: second.rawBody,
      signatureHeader: second.signatureHeader,
    });

    const payment = await prisma.payment.findFirstOrThrow({
      where: { providerPaymentRef: remote.providerPaymentRef },
    });
    const receipts = await prisma.receipt.count({
      where: { paymentId: payment.id },
    });
    expect(receipts).toBe(1);
  });
});

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { allowFinancialHardDelete } from "@/server/db/financial-mutation";
import { MockPaymentProvider } from "@/server/payments/mock-provider";
import {
  processProviderWebhook,
  WebhookSignatureError,
} from "@/server/payments/webhook-processor";

const prisma = new PrismaClient();
const suffix = `t${Date.now().toString(36)}`;

describe("payment webhooks", () => {
  let memberId: string;
  let provider: MockPaymentProvider;

  beforeAll(async () => {
    const member = await prisma.member.create({
      data: {
        membershipNumber: `RJGC-TEST-${suffix}`,
        firstName: "Test",
        lastName: "Member",
        displayName: `[SAMPLE] Test Member ${suffix}`,
        email: `test.${suffix}@rjgc.local`,
        status: "ACTIVE",
        isSample: true,
        internalNotes: "Automated payment test record",
      },
    });
    memberId = member.id;
  });

  beforeEach(async () => {
    provider = new MockPaymentProvider({ webhookSecret: "test-secret" });
    // Partial unique: at most one open mandate per member.
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
    await allowFinancialHardDelete(prisma);
    await prisma.providerWebhookEvent.deleteMany({
      where: { provider: "mock" },
    });
    await prisma.receipt.deleteMany({
      where: { payment: { memberId } },
    });
    await prisma.paymentAttempt.deleteMany({
      where: { payment: { memberId } },
    });
    await prisma.payment.deleteMany({ where: { memberId } });
    await prisma.invoice.deleteMany({ where: { memberId } });
    await prisma.paymentMandate.deleteMany({ where: { memberId } });
    await prisma.member.delete({ where: { id: memberId } });
    await prisma.$disconnect();
  });

  it("rejects invalid webhook signatures", async () => {
    const { rawBody } = provider.signWebhook({
      id: `evt_invalid_${suffix}`,
      event: "payment.captured",
      payload: { paymentRef: "x", paymentStatus: "SUCCESS" },
    });

    await expect(
      processProviderWebhook({
        prisma,
        provider,
        rawBody,
        signatureHeader: "not-a-valid-signature",
      }),
    ).rejects.toBeInstanceOf(WebhookSignatureError);
  });

  it("marks a payment SUCCESS only after a verified webhook", async () => {
    const remote = await provider.createPayment({
      amountPaise: 10000,
      memberId,
    });
    expect(remote.status).toBe("PENDING");

    const payment = await prisma.payment.create({
      data: {
        memberId,
        amountPaise: 10000,
        currency: "INR",
        status: "PENDING",
        method: "MANDATE",
        provider: "mock",
        providerPaymentRef: remote.providerPaymentRef,
        notes: "Awaiting webhook",
      },
    });

    const signed = provider.signWebhook({
      id: `evt_success_${suffix}`,
      event: "payment.captured",
      payload: {
        paymentRef: remote.providerPaymentRef,
        paymentStatus: "SUCCESS",
        amountPaise: 10000,
      },
    });

    const result = await processProviderWebhook({
      prisma,
      provider,
      rawBody: signed.rawBody,
      signatureHeader: signed.signatureHeader,
    });
    expect(result.status).toBe("processed");

    const updated = await prisma.payment.findUniqueOrThrow({
      where: { id: payment.id },
      include: { receipt: true },
    });
    expect(updated.status).toBe("SUCCESS");
    expect(updated.paidAt).not.toBeNull();
    expect(updated.receipt).not.toBeNull();
  });

  it("records a failed payment from a verified webhook", async () => {
    const remote = await provider.createPayment({
      amountPaise: 20000,
      memberId,
    });
    const payment = await prisma.payment.create({
      data: {
        memberId,
        amountPaise: 20000,
        status: "PENDING",
        method: "MANDATE",
        provider: "mock",
        providerPaymentRef: remote.providerPaymentRef,
      },
    });

    const signed = provider.signWebhook({
      id: `evt_fail_${suffix}`,
      event: "payment.failed",
      payload: {
        paymentRef: remote.providerPaymentRef,
        paymentStatus: "FAILED",
        failureCode: "INSUFFICIENT_FUNDS",
        failureMessage: "Insufficient funds",
      },
    });

    await processProviderWebhook({
      prisma,
      provider,
      rawBody: signed.rawBody,
      signatureHeader: signed.signatureHeader,
    });

    const updated = await prisma.payment.findUniqueOrThrow({
      where: { id: payment.id },
    });
    expect(updated.status).toBe("FAILED");
    expect(updated.paidAt).toBeNull();
  });

  it("ignores duplicate webhook events idempotently", async () => {
    const remote = await provider.createPayment({
      amountPaise: 30000,
      memberId,
    });
    await prisma.payment.create({
      data: {
        memberId,
        amountPaise: 30000,
        status: "PENDING",
        method: "MANDATE",
        provider: "mock",
        providerPaymentRef: remote.providerPaymentRef,
      },
    });

    const signed = provider.signWebhook({
      id: `evt_dup_${suffix}`,
      event: "payment.captured",
      payload: {
        paymentRef: remote.providerPaymentRef,
        paymentStatus: "SUCCESS",
      },
    });

    const first = await processProviderWebhook({
      prisma,
      provider,
      rawBody: signed.rawBody,
      signatureHeader: signed.signatureHeader,
    });
    const second = await processProviderWebhook({
      prisma,
      provider,
      rawBody: signed.rawBody,
      signatureHeader: signed.signatureHeader,
    });

    expect(first.status).toBe("processed");
    expect(second.status).toBe("duplicate");
  });

  it("cancels a mandate from a verified webhook", async () => {
    const customer = await provider.createCustomer({
      email: `cancel.${suffix}@rjgc.local`,
      name: "Cancel Test",
      memberId,
    });
    const plan = await provider.createPlan({
      name: "Cancel plan",
      amountPaise: 1000,
      interval: "monthly",
    });
    const remote = await provider.createMandate({
      providerCustomerRef: customer.providerCustomerRef,
      providerPlanRef: plan.providerPlanRef,
      memberId,
    });

    const mandate = await prisma.paymentMandate.create({
      data: {
        memberId,
        status: "ACTIVE",
        provider: "mock",
        providerCustomerRef: customer.providerCustomerRef,
        providerPlanRef: plan.providerPlanRef,
        providerMandateRef: remote.providerMandateRef,
        providerSubscriptionRef: remote.providerSubscriptionRef,
        amountPaise: 1000,
      },
    });

    const signed = provider.signWebhook({
      id: `evt_cancel_${suffix}`,
      event: "subscription.cancelled",
      payload: {
        mandateRef: remote.providerMandateRef,
        mandateStatus: "CANCELLED",
      },
    });

    await processProviderWebhook({
      prisma,
      provider,
      rawBody: signed.rawBody,
      signatureHeader: signed.signatureHeader,
    });

    const updated = await prisma.paymentMandate.findUniqueOrThrow({
      where: { id: mandate.id },
    });
    expect(updated.status).toBe("CANCELLED");
  });

  it("records a failed recurring debit against the mandate", async () => {
    const customer = await provider.createCustomer({
      email: `debit.${suffix}@rjgc.local`,
      name: "Debit Test",
      memberId,
    });
    const plan = await provider.createPlan({
      name: "Debit plan",
      amountPaise: 5000,
      interval: "monthly",
    });
    const remote = await provider.createMandate({
      providerCustomerRef: customer.providerCustomerRef,
      providerPlanRef: plan.providerPlanRef,
      memberId,
    });

    const mandate = await prisma.paymentMandate.create({
      data: {
        memberId,
        status: "ACTIVE",
        provider: "mock",
        providerMandateRef: remote.providerMandateRef,
        providerSubscriptionRef: remote.providerSubscriptionRef,
        amountPaise: 5000,
      },
    });

    const signed = provider.signWebhook({
      id: `evt_debit_fail_${suffix}`,
      event: "recurring.debit.failed",
      payload: {
        mandateRef: remote.providerMandateRef,
        paymentStatus: "FAILED",
        amountPaise: 5000,
        failureCode: "DEBIT_FAILED",
        failureMessage: "Recurring debit failed",
      },
    });

    await processProviderWebhook({
      prisma,
      provider,
      rawBody: signed.rawBody,
      signatureHeader: signed.signatureHeader,
    });

    const failed = await prisma.payment.findFirst({
      where: { memberId, mandateId: mandate.id, status: "FAILED" },
    });
    expect(failed).not.toBeNull();
    expect(failed?.paidAt).toBeNull();

    const updatedMandate = await prisma.paymentMandate.findUniqueOrThrow({
      where: { id: mandate.id },
    });
    expect(updatedMandate.note).toContain("Recurring debit failed");
  });
});

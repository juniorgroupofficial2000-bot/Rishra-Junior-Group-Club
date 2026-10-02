import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import type { PaymentProvider } from "@/server/payments/provider";
import type {
  CreateCustomerInput,
  CreateMandateInput,
  CreatePaymentInput,
  CreatePlanInput,
  ProviderMandate,
  ProviderPayment,
  ProviderPaymentStatus,
  RefundPaymentInput,
  VerifiedWebhookEvent,
} from "@/server/payments/types";

type StoredMandate = ProviderMandate & { cancelled?: boolean };
type StoredPayment = ProviderPayment;

export type MockPaymentProviderOptions = {
  webhookSecret?: string;
  /** Force createPayment to fail (for tests). */
  failNextPayment?: boolean;
  /** Force createMandate initial status. */
  mandateInitialStatus?: ProviderMandate["status"];
};

/**
 * In-memory payment provider for automated tests and local sandbox simulation.
 * Never used for real money movement.
 */
export class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock";
  readonly mode = "test" as const;

  private readonly webhookSecret: string;
  private failNextPayment: boolean;
  private mandateInitialStatus: ProviderMandate["status"];
  private customers = new Map<string, { email: string; name: string }>();
  private plans = new Map<string, { amountPaise: number; currency: string }>();
  private mandates = new Map<string, StoredMandate>();
  private payments = new Map<string, StoredPayment>();

  constructor(options: MockPaymentProviderOptions = {}) {
    this.webhookSecret = options.webhookSecret ?? "mock-webhook-secret";
    this.failNextPayment = options.failNextPayment ?? false;
    this.mandateInitialStatus = options.mandateInitialStatus ?? "PENDING";
  }

  setFailNextPayment(value: boolean) {
    this.failNextPayment = value;
  }

  async createCustomer(input: CreateCustomerInput) {
    const providerCustomerRef = `cus_mock_${input.memberId.slice(0, 8)}_${randomUUID().slice(0, 8)}`;
    this.customers.set(providerCustomerRef, {
      email: input.email,
      name: input.name,
    });
    return { providerCustomerRef };
  }

  async createPlan(input: CreatePlanInput) {
    const providerPlanRef = `plan_mock_${randomUUID().slice(0, 10)}`;
    this.plans.set(providerPlanRef, {
      amountPaise: input.amountPaise,
      currency: input.currency ?? "INR",
    });
    return {
      providerPlanRef,
      amountPaise: input.amountPaise,
      currency: input.currency ?? "INR",
      interval: input.interval,
    };
  }

  async createMandate(input: CreateMandateInput): Promise<ProviderMandate> {
    const providerMandateRef = `mandate_mock_${randomUUID().slice(0, 10)}`;
    const providerSubscriptionRef = `sub_mock_${randomUUID().slice(0, 10)}`;
    const nextDebitAt = new Date();
    nextDebitAt.setMonth(nextDebitAt.getMonth() + 1);
    const mandate: StoredMandate = {
      providerMandateRef,
      providerSubscriptionRef,
      providerCustomerRef: input.providerCustomerRef,
      providerPlanRef: input.providerPlanRef,
      status: this.mandateInitialStatus,
      nextDebitAt,
      setupUrl: `https://payments.example.test/setup/${providerMandateRef}`,
    };
    this.mandates.set(providerMandateRef, mandate);
    return mandate;
  }

  async fetchMandate(providerMandateRef: string): Promise<ProviderMandate> {
    const mandate = this.mandates.get(providerMandateRef);
    if (!mandate) throw new Error("Mock mandate not found.");
    return mandate;
  }

  async cancelMandate(providerMandateRef: string): Promise<ProviderMandate> {
    const mandate = await this.fetchMandate(providerMandateRef);
    const updated = { ...mandate, status: "CANCELLED" as const, cancelled: true };
    this.mandates.set(providerMandateRef, updated);
    return updated;
  }

  async pauseMandate(providerMandateRef: string): Promise<ProviderMandate> {
    const mandate = await this.fetchMandate(providerMandateRef);
    const updated = { ...mandate, status: "PAUSED" as const };
    this.mandates.set(providerMandateRef, updated);
    return updated;
  }

  async resumeMandate(providerMandateRef: string): Promise<ProviderMandate> {
    const mandate = await this.fetchMandate(providerMandateRef);
    const updated = { ...mandate, status: "ACTIVE" as const };
    this.mandates.set(providerMandateRef, updated);
    return updated;
  }

  async createPayment(input: CreatePaymentInput): Promise<ProviderPayment> {
    const providerPaymentRef = `pay_mock_${randomUUID().slice(0, 10)}`;
    const providerOrderRef = `order_mock_${randomUUID().slice(0, 10)}`;
    if (this.failNextPayment) {
      this.failNextPayment = false;
      const failed: ProviderPayment = {
        providerPaymentRef,
        providerOrderRef,
        status: "FAILED",
        amountPaise: input.amountPaise,
        currency: input.currency ?? "INR",
        failureCode: "MOCK_DECLINED",
        failureMessage: "Mock provider declined the payment.",
      };
      this.payments.set(providerPaymentRef, failed);
      return failed;
    }

    const pending: ProviderPayment = {
      providerPaymentRef,
      providerOrderRef,
      status: "PENDING",
      amountPaise: input.amountPaise,
      currency: input.currency ?? "INR",
    };
    this.payments.set(providerPaymentRef, pending);
    return pending;
  }

  async fetchPayment(providerPaymentRef: string): Promise<ProviderPayment> {
    const payment = this.payments.get(providerPaymentRef);
    if (!payment) throw new Error("Mock payment not found.");
    return payment;
  }

  async refundPayment(input: RefundPaymentInput) {
    const payment = await this.fetchPayment(input.providerPaymentRef);
    if (payment.status !== "SUCCESS") {
      return {
        providerRefundRef: `rfnd_mock_${randomUUID().slice(0, 8)}`,
        providerPaymentRef: payment.providerPaymentRef,
        status: "FAILED" as const,
        amountPaise: input.amountPaise ?? payment.amountPaise,
      };
    }
    const updated = { ...payment, status: "REFUNDED" as const };
    this.payments.set(payment.providerPaymentRef, updated);
    return {
      providerRefundRef: `rfnd_mock_${randomUUID().slice(0, 8)}`,
      providerPaymentRef: payment.providerPaymentRef,
      status: "SUCCESS" as const,
      amountPaise: input.amountPaise ?? payment.amountPaise,
    };
  }

  async verifyWebhook(input: {
    rawBody: string;
    signatureHeader: string | null;
  }): Promise<VerifiedWebhookEvent> {
    if (!input.signatureHeader) {
      throw new Error("Missing webhook signature.");
    }
    const expected = createHmac("sha256", this.webhookSecret)
      .update(input.rawBody)
      .digest("hex");
    const provided = input.signatureHeader;
    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new Error("Invalid webhook signature.");
    }

    const body = JSON.parse(input.rawBody) as {
      id: string;
      event: string;
      payload: Record<string, unknown>;
    };

    const paymentStatus = body.payload.paymentStatus as
      | ProviderPaymentStatus
      | undefined;
    const mandateStatus = body.payload.mandateStatus as
      | ProviderMandate["status"]
      | undefined;

    if (
      typeof body.payload.paymentRef === "string" &&
      paymentStatus &&
      this.payments.has(body.payload.paymentRef)
    ) {
      const existing = this.payments.get(body.payload.paymentRef)!;
      this.payments.set(body.payload.paymentRef, {
        ...existing,
        status: paymentStatus,
        paidAt:
          paymentStatus === "SUCCESS"
            ? new Date()
            : existing.paidAt ?? null,
        failureCode:
          typeof body.payload.failureCode === "string"
            ? body.payload.failureCode
            : existing.failureCode,
        failureMessage:
          typeof body.payload.failureMessage === "string"
            ? body.payload.failureMessage
            : existing.failureMessage,
      });
    }

    if (
      typeof body.payload.mandateRef === "string" &&
      mandateStatus &&
      this.mandates.has(body.payload.mandateRef)
    ) {
      const existing = this.mandates.get(body.payload.mandateRef)!;
      this.mandates.set(body.payload.mandateRef, {
        ...existing,
        status: mandateStatus,
        nextDebitAt:
          body.payload.nextDebitAt
            ? new Date(String(body.payload.nextDebitAt))
            : existing.nextDebitAt,
      });
    }

    return {
      providerEventId: body.id,
      eventType: body.event,
      payload: body.payload,
      paymentRef:
        typeof body.payload.paymentRef === "string"
          ? body.payload.paymentRef
          : null,
      mandateRef:
        typeof body.payload.mandateRef === "string"
          ? body.payload.mandateRef
          : null,
      subscriptionRef:
        typeof body.payload.subscriptionRef === "string"
          ? body.payload.subscriptionRef
          : null,
      paymentStatus: paymentStatus ?? null,
      mandateStatus: mandateStatus ?? null,
      amountPaise:
        typeof body.payload.amountPaise === "number"
          ? body.payload.amountPaise
          : null,
      failureCode:
        typeof body.payload.failureCode === "string"
          ? body.payload.failureCode
          : null,
      failureMessage:
        typeof body.payload.failureMessage === "string"
          ? body.payload.failureMessage
          : null,
      nextDebitAt: body.payload.nextDebitAt
        ? new Date(String(body.payload.nextDebitAt))
        : null,
      occurredAt: new Date(),
    };
  }

  /** Test helper: build a signed webhook payload. */
  signWebhook(event: {
    id: string;
    event: string;
    payload: Record<string, unknown>;
  }) {
    const rawBody = JSON.stringify(event);
    const signatureHeader = createHmac("sha256", this.webhookSecret)
      .update(rawBody)
      .digest("hex");
    return { rawBody, signatureHeader };
  }
}

import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import type { PaymentProvider } from "@/server/payments/provider";
import type {
  CreateCustomerInput,
  CreateMandateInput,
  CreatePaymentInput,
  CreatePlanInput,
  ProviderMandate,
  ProviderMandateStatus,
  ProviderPayment,
  ProviderPaymentStatus,
  RefundPaymentInput,
  VerifiedWebhookEvent,
} from "@/server/payments/types";

type RazorpayConfig = {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
  mode: "test" | "live";
};

/**
 * Razorpay sandbox/live adapter.
 * Secrets come from environment variables only — never from the browser.
 */
export class RazorpayPaymentProvider implements PaymentProvider {
  readonly name = "razorpay";
  readonly mode: "test" | "live";
  private readonly keyId: string;
  private readonly keySecret: string;
  private readonly webhookSecret: string;

  constructor(config: RazorpayConfig) {
    this.keyId = config.keyId;
    this.keySecret = config.keySecret;
    this.webhookSecret = config.webhookSecret;
    this.mode = config.mode;
  }

  private authHeader() {
    const token = Buffer.from(`${this.keyId}:${this.keySecret}`).toString(
      "base64",
    );
    return `Basic ${token}`;
  }

  private async api<T>(
    path: string,
    init?: { method?: string; body?: Record<string, unknown> },
  ): Promise<T> {
    const response = await fetch(`https://api.razorpay.com/v1${path}`, {
      method: init?.method ?? "GET",
      headers: {
        Authorization: this.authHeader(),
        "Content-Type": "application/json",
      },
      body: init?.body ? JSON.stringify(init.body) : undefined,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Razorpay API ${path} failed: ${response.status} ${text}`);
    }
    return (await response.json()) as T;
  }

  async createCustomer(input: CreateCustomerInput) {
    const result = await this.api<{ id: string }>("/customers", {
      method: "POST",
      body: {
        name: input.name,
        email: input.email,
        fail_existing: "0",
        notes: { memberId: input.memberId },
      },
    });
    return { providerCustomerRef: result.id };
  }

  async createPlan(input: CreatePlanInput) {
    const period = input.interval === "yearly" ? "yearly" : "monthly";
    const result = await this.api<{ id: string }>("/plans", {
      method: "POST",
      body: {
        period,
        interval: 1,
        item: {
          name: input.name,
          amount: input.amountPaise,
          currency: input.currency ?? "INR",
        },
      },
    });
    return {
      providerPlanRef: result.id,
      amountPaise: input.amountPaise,
      currency: input.currency ?? "INR",
      interval: input.interval,
    };
  }

  async createMandate(input: CreateMandateInput): Promise<ProviderMandate> {
    const result = await this.api<{
      id: string;
      status: string;
      customer_id?: string;
      plan_id?: string;
      short_url?: string;
    }>("/subscriptions", {
      method: "POST",
      body: {
        plan_id: input.providerPlanRef,
        customer_id: input.providerCustomerRef,
        total_count: input.totalCount ?? 120,
        customer_notify: 1,
        notes: { memberId: input.memberId },
      },
    });

    return {
      providerMandateRef: result.id,
      providerSubscriptionRef: result.id,
      providerCustomerRef: result.customer_id ?? input.providerCustomerRef,
      providerPlanRef: result.plan_id ?? input.providerPlanRef,
      status: mapRazorpaySubscriptionStatus(result.status),
      setupUrl: result.short_url ?? null,
      nextDebitAt: null,
    };
  }

  async fetchMandate(providerMandateRef: string): Promise<ProviderMandate> {
    const result = await this.api<{
      id: string;
      status: string;
      customer_id?: string;
      plan_id?: string;
    }>(`/subscriptions/${providerMandateRef}`);
    return {
      providerMandateRef: result.id,
      providerSubscriptionRef: result.id,
      providerCustomerRef: result.customer_id ?? null,
      providerPlanRef: result.plan_id ?? null,
      status: mapRazorpaySubscriptionStatus(result.status),
      nextDebitAt: null,
    };
  }

  async cancelMandate(providerMandateRef: string): Promise<ProviderMandate> {
    const result = await this.api<{
      id: string;
      status: string;
      customer_id?: string;
      plan_id?: string;
    }>(`/subscriptions/${providerMandateRef}/cancel`, {
      method: "POST",
      body: { cancel_at_cycle_end: 0 },
    });
    return {
      providerMandateRef: result.id,
      providerSubscriptionRef: result.id,
      providerCustomerRef: result.customer_id ?? null,
      providerPlanRef: result.plan_id ?? null,
      status: mapRazorpaySubscriptionStatus(result.status),
    };
  }

  async pauseMandate(providerMandateRef: string): Promise<ProviderMandate> {
    const result = await this.api<{
      id: string;
      status: string;
    }>(`/subscriptions/${providerMandateRef}/pause`, {
      method: "POST",
      body: { pause_by: "self" },
    });
    return {
      providerMandateRef: result.id,
      providerSubscriptionRef: result.id,
      status: mapRazorpaySubscriptionStatus(result.status),
    };
  }

  async resumeMandate(providerMandateRef: string): Promise<ProviderMandate> {
    const result = await this.api<{
      id: string;
      status: string;
    }>(`/subscriptions/${providerMandateRef}/resume`, {
      method: "POST",
      body: { resume_by: "self" },
    });
    return {
      providerMandateRef: result.id,
      providerSubscriptionRef: result.id,
      status: mapRazorpaySubscriptionStatus(result.status),
    };
  }

  async createPayment(input: CreatePaymentInput): Promise<ProviderPayment> {
    // Razorpay Orders API returns an order id — not a payment id.
    const result = await this.api<{
      id: string;
      status: string;
      amount: number;
      currency: string;
    }>("/orders", {
      method: "POST",
      body: {
        amount: input.amountPaise,
        currency: input.currency ?? "INR",
        receipt: input.receipt ?? input.memberId.slice(0, 40),
        notes: {
          memberId: input.memberId,
          mandateRef: input.providerMandateRef ?? "",
        },
      },
    });

    return {
      providerOrderRef: result.id,
      providerPaymentRef: null,
      status: mapRazorpayPaymentStatus(result.status),
      amountPaise: result.amount,
      currency: result.currency,
    };
  }

  async fetchPayment(providerPaymentRef: string): Promise<ProviderPayment> {
    const result = await this.api<{
      id: string;
      status: string;
      amount: number;
      currency: string;
      error_code?: string;
      error_description?: string;
    }>(`/payments/${providerPaymentRef}`);

    return {
      providerPaymentRef: result.id,
      status: mapRazorpayPaymentStatus(result.status),
      amountPaise: result.amount,
      currency: result.currency,
      paidAt: result.status === "captured" ? new Date() : null,
      failureCode: result.error_code ?? null,
      failureMessage: result.error_description ?? null,
    };
  }

  async refundPayment(input: RefundPaymentInput) {
    const result = await this.api<{
      id: string;
      payment_id: string;
      amount: number;
      status: string;
    }>(`/payments/${input.providerPaymentRef}/refund`, {
      method: "POST",
      body: {
        amount: input.amountPaise,
        notes: { reason: input.reason ?? "admin_refund" },
      },
    });

    return {
      providerRefundRef: result.id,
      providerPaymentRef: result.payment_id,
      status:
        result.status === "processed"
          ? ("SUCCESS" as const)
          : result.status === "failed"
            ? ("FAILED" as const)
            : ("PENDING" as const),
      amountPaise: result.amount,
    };
  }

  async verifyWebhook(input: {
    rawBody: string;
    signatureHeader: string | null;
  }): Promise<VerifiedWebhookEvent> {
    if (!input.signatureHeader) {
      throw new Error("Missing Razorpay webhook signature.");
    }

    const expected = createHmac("sha256", this.webhookSecret)
      .update(input.rawBody)
      .digest("hex");

    const a = Buffer.from(expected);
    const b = Buffer.from(input.signatureHeader);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new Error("Invalid Razorpay webhook signature.");
    }

    const body = JSON.parse(input.rawBody) as {
      event: string;
      payload?: Record<string, unknown>;
      created_at?: number;
    };

    // Razorpay may nest payment + subscription entities in the same event
    // (e.g. subscription.charged). Prefer the payment entity for ledger refs.
    const paymentEntity =
      (
        body.payload?.payment as
          | { entity?: Record<string, unknown> }
          | undefined
      )?.entity ?? null;
    const subscriptionEntity =
      (
        body.payload?.subscription as
          | { entity?: Record<string, unknown> }
          | undefined
      )?.entity ?? null;
    const orderEntity =
      (body.payload?.order as { entity?: Record<string, unknown> } | undefined)
        ?.entity ?? null;

    const idForEvent =
      (typeof paymentEntity?.id === "string" && paymentEntity.id) ||
      (typeof subscriptionEntity?.id === "string" && subscriptionEntity.id) ||
      (typeof orderEntity?.id === "string" && orderEntity.id) ||
      null;

    const providerEventId = idForEvent
      ? `${body.event}:${idForEvent}:${body.created_at ?? "0"}`
      : `${body.event}:${createHmac("sha256", input.rawBody).digest("hex").slice(0, 24)}`;

    // Prefer payload.payment.entity whenever present (including subscription.charged).
    const paymentRef =
      typeof paymentEntity?.id === "string" ? paymentEntity.id : null;

    const orderRef =
      (typeof paymentEntity?.order_id === "string" && paymentEntity.order_id) ||
      (typeof orderEntity?.id === "string" && orderEntity.id) ||
      null;

    const subscriptionRef =
      (typeof subscriptionEntity?.id === "string" && subscriptionEntity.id) ||
      (typeof paymentEntity?.subscription_id === "string" &&
        paymentEntity.subscription_id) ||
      null;

    return {
      providerEventId,
      eventType: body.event,
      payload: body.payload ?? {},
      paymentRef,
      orderRef,
      mandateRef: subscriptionRef,
      subscriptionRef,
      paymentStatus:
        typeof paymentEntity?.status === "string"
          ? mapRazorpayPaymentStatus(String(paymentEntity.status))
          : null,
      mandateStatus:
        typeof subscriptionEntity?.status === "string"
          ? mapRazorpaySubscriptionStatus(String(subscriptionEntity.status))
          : null,
      amountPaise:
        typeof paymentEntity?.amount === "number"
          ? paymentEntity.amount
          : typeof subscriptionEntity?.amount === "number"
            ? subscriptionEntity.amount
            : null,
      failureCode:
        typeof paymentEntity?.error_code === "string"
          ? paymentEntity.error_code
          : null,
      failureMessage:
        typeof paymentEntity?.error_description === "string"
          ? paymentEntity.error_description
          : null,
      nextDebitAt: null,
      occurredAt: body.created_at
        ? new Date(body.created_at * 1000)
        : new Date(),
    };
  }
}

function mapRazorpayPaymentStatus(status: string): ProviderPaymentStatus {
  switch (status) {
    case "created":
      return "CREATED";
    case "authorized":
      return "AUTHORIZED";
    case "captured":
    case "paid":
      return "SUCCESS";
    case "failed":
      return "FAILED";
    case "refunded":
      return "REFUNDED";
    case "cancelled":
      return "CANCELLED";
    default:
      return "PENDING";
  }
}

function mapRazorpaySubscriptionStatus(status: string): ProviderMandateStatus {
  switch (status) {
    case "created":
      return "CREATED";
    case "authenticated":
    case "active":
      return "ACTIVE";
    case "pending":
    case "halted":
      return "PENDING";
    case "paused":
      return "PAUSED";
    case "cancelled":
      return "CANCELLED";
    case "completed":
    case "expired":
      return "EXPIRED";
    default:
      return "FAILED";
  }
}

export function createRazorpayProviderFromEnv(): RazorpayPaymentProvider {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!keyId || !keySecret || !webhookSecret) {
    throw new Error(
      "Razorpay provider requires RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, and RAZORPAY_WEBHOOK_SECRET.",
    );
  }
  const mode = process.env.PAYMENT_MODE === "live" ? "live" : "test";
  const looksLive = keyId.startsWith("rzp_live_");
  const looksTest = keyId.startsWith("rzp_test_");
  if (mode === "live" && !looksLive) {
    throw new Error(
      "PAYMENT_MODE=live requires a Razorpay live key id (rzp_live_*).",
    );
  }
  if (mode === "test" && looksLive) {
    throw new Error(
      "Live Razorpay key detected while PAYMENT_MODE=test. Set PAYMENT_MODE=live intentionally, or use rzp_test_* keys.",
    );
  }
  if (!looksLive && !looksTest) {
    throw new Error("RAZORPAY_KEY_ID must start with rzp_test_ or rzp_live_.");
  }
  return new RazorpayPaymentProvider({
    keyId,
    keySecret,
    webhookSecret,
    mode,
  });
}

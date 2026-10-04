export type ProviderName = "mock" | "razorpay";

export type ProviderPaymentStatus =
  | "CREATED"
  | "PENDING"
  | "AUTHORIZED"
  | "SUCCESS"
  | "FAILED"
  | "REFUNDED"
  | "CANCELLED";

export type ProviderMandateStatus =
  | "CREATED"
  | "PENDING"
  | "ACTIVE"
  | "PAUSED"
  | "FAILED"
  | "CANCELLED"
  | "EXPIRED";

export type ProviderCustomer = {
  providerCustomerRef: string;
};

export type ProviderPlan = {
  providerPlanRef: string;
  amountPaise: number;
  currency: string;
  interval: "monthly" | "yearly";
};

export type ProviderMandate = {
  providerMandateRef: string;
  providerSubscriptionRef?: string | null;
  providerCustomerRef?: string | null;
  providerPlanRef?: string | null;
  status: ProviderMandateStatus;
  nextDebitAt?: Date | null;
  setupUrl?: string | null;
};

export type ProviderPayment = {
  /**
   * Provider payment id when known.
   * For Razorpay order creation this may be null until a payment webhook arrives.
   */
  providerPaymentRef: string | null;
  /** Provider order id (Razorpay `order_*`) when the create call returns an order. */
  providerOrderRef?: string | null;
  status: ProviderPaymentStatus;
  amountPaise: number;
  currency: string;
  paidAt?: Date | null;
  failureCode?: string | null;
  failureMessage?: string | null;
};

export type ProviderRefund = {
  providerRefundRef: string;
  providerPaymentRef: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  amountPaise: number;
};

export type VerifiedWebhookEvent = {
  providerEventId: string;
  eventType: string;
  /** Normalized domain event after signature verification. */
  payload: Record<string, unknown>;
  /** Related provider refs when present. */
  paymentRef?: string | null;
  /** Order id used to link Razorpay payments back to locally created orders. */
  orderRef?: string | null;
  mandateRef?: string | null;
  subscriptionRef?: string | null;
  paymentStatus?: ProviderPaymentStatus | null;
  mandateStatus?: ProviderMandateStatus | null;
  amountPaise?: number | null;
  failureCode?: string | null;
  failureMessage?: string | null;
  nextDebitAt?: Date | null;
  occurredAt?: Date | null;
};

export type CreateCustomerInput = {
  email: string;
  name: string;
  memberId: string;
};

export type CreatePlanInput = {
  name: string;
  amountPaise: number;
  currency?: string;
  interval: "monthly" | "yearly";
};

export type CreateMandateInput = {
  providerCustomerRef: string;
  providerPlanRef: string;
  memberId: string;
  totalCount?: number;
};

export type CreatePaymentInput = {
  amountPaise: number;
  currency?: string;
  memberId: string;
  providerCustomerRef?: string;
  providerMandateRef?: string;
  receipt?: string;
};

export type RefundPaymentInput = {
  providerPaymentRef: string;
  amountPaise?: number;
  reason?: string;
};

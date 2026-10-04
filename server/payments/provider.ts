import type {
  CreateCustomerInput,
  CreateMandateInput,
  CreatePaymentInput,
  CreatePlanInput,
  ProviderCustomer,
  ProviderMandate,
  ProviderPayment,
  ProviderPlan,
  ProviderRefund,
  RefundPaymentInput,
  VerifiedWebhookEvent,
} from "@/server/payments/types";

/**
 * Payment provider port.
 * Application code depends on this interface — never on a concrete SDK.
 */
export interface PaymentProvider {
  readonly name: string;
  readonly mode: "test" | "live";

  createCustomer(input: CreateCustomerInput): Promise<ProviderCustomer>;
  createPlan(input: CreatePlanInput): Promise<ProviderPlan>;
  createMandate(input: CreateMandateInput): Promise<ProviderMandate>;
  fetchMandate(providerMandateRef: string): Promise<ProviderMandate>;
  cancelMandate(providerMandateRef: string): Promise<ProviderMandate>;
  /** Returns null when the provider does not support pause. */
  pauseMandate(providerMandateRef: string): Promise<ProviderMandate | null>;
  /** Returns null when the provider does not support resume. */
  resumeMandate(providerMandateRef: string): Promise<ProviderMandate | null>;
  createPayment(input: CreatePaymentInput): Promise<ProviderPayment>;
  fetchPayment(providerPaymentRef: string): Promise<ProviderPayment>;
  /** Returns null when refunds are unsupported. */
  refundPayment(input: RefundPaymentInput): Promise<ProviderRefund | null>;
  /**
   * Verify webhook authenticity and normalize the event.
   * Throws on invalid signature.
   */
  verifyWebhook(input: {
    rawBody: string;
    signatureHeader: string | null;
  }): Promise<VerifiedWebhookEvent>;
}

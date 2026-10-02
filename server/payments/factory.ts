import "server-only";

import { isProductionRuntime } from "@/server/security/env";
import { MockPaymentProvider } from "@/server/payments/mock-provider";
import type { PaymentProvider } from "@/server/payments/provider";
import { createRazorpayProviderFromEnv } from "@/server/payments/razorpay-provider";
import type { ProviderName } from "@/server/payments/types";
import { randomBytes } from "node:crypto";

let cached: PaymentProvider | null = null;
let ephemeralMockSecret: string | null = null;

export function getPaymentProviderName(): ProviderName {
  const value = process.env.PAYMENT_PROVIDER?.toLowerCase();
  if (value === "razorpay") return "razorpay";
  return "mock";
}

function resolveMockWebhookSecret(): string {
  const configured = process.env.PAYMENT_WEBHOOK_SECRET?.trim();
  if (configured) return configured;

  if (isProductionRuntime()) {
    throw new Error(
      "PAYMENT_WEBHOOK_SECRET is required when using the mock payment provider.",
    );
  }

  // Ephemeral per-process secret avoids a globally known default in local/dev.
  if (!ephemeralMockSecret) {
    ephemeralMockSecret = randomBytes(32).toString("hex");
  }
  return ephemeralMockSecret;
}

/**
 * Resolve the configured payment provider adapter.
 * Production fails closed: no silent Razorpay→mock fallback, no known default webhook secret.
 */
export function getPaymentProvider(): PaymentProvider {
  if (cached) return cached;

  const name = getPaymentProviderName();
  if (name === "razorpay") {
    try {
      cached = createRazorpayProviderFromEnv();
      return cached;
    } catch (error) {
      // Never silently degrade to mock — forged webhooks would mark payments SUCCESS.
      throw error instanceof Error
        ? error
        : new Error("Razorpay provider configuration is invalid.");
    }
  }

  if (
    isProductionRuntime() &&
    process.env.ALLOW_MOCK_PAYMENTS !== "true"
  ) {
    throw new Error(
      "Mock payment provider is blocked in production. Set PAYMENT_PROVIDER=razorpay or ALLOW_MOCK_PAYMENTS=true for controlled sandbox deploys.",
    );
  }

  cached = new MockPaymentProvider({
    webhookSecret: resolveMockWebhookSecret(),
  });
  return cached;
}

/** Test-only override. */
export function setPaymentProviderForTests(provider: PaymentProvider | null) {
  cached = provider;
}

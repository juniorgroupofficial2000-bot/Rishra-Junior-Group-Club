import "server-only";

import { getServerEnv, isProductionAppEnv } from "@/config";
import { MockPaymentProvider } from "@/server/payments/mock-provider";
import type { PaymentProvider } from "@/server/payments/provider";
import { createRazorpayProviderFromEnv } from "@/server/payments/razorpay-provider";
import type { ProviderName } from "@/server/payments/types";
import { randomBytes } from "node:crypto";

let cached: PaymentProvider | null = null;
let ephemeralMockSecret: string | null = null;

export function getPaymentProviderName(): ProviderName {
  return getServerEnv().paymentProvider;
}

function resolveMockWebhookSecret(): string {
  const env = getServerEnv();
  const configured = env.PAYMENT_WEBHOOK_SECRET;
  if (configured) return configured;

  if (isProductionAppEnv(env.appEnv) || env.NODE_ENV === "production") {
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

  const env = getServerEnv();
  const name = env.paymentProvider;
  if (name === "razorpay") {
    try {
      const razorpay = createRazorpayProviderFromEnv();
      cached = razorpay;
      return razorpay;
    } catch (error) {
      // Never silently degrade to mock — forged webhooks would mark payments SUCCESS.
      throw error instanceof Error
        ? error
        : new Error("Razorpay provider configuration is invalid.");
    }
  }

  if (isProductionAppEnv(env.appEnv)) {
    throw new Error(
      "Mock payment provider is blocked when APP_ENV=production. Use staging for sandbox payments.",
    );
  }

  if (env.NODE_ENV === "production" && env.appEnv === "staging") {
    const allowMock = env.ALLOW_MOCK_PAYMENTS;
    const confirmed =
      env.MOCK_PAYMENTS_CONFIRM === "I_UNDERSTAND_NO_REAL_MONEY";
    if (!allowMock || !confirmed) {
      throw new Error(
        "Mock payment provider on staging requires ALLOW_MOCK_PAYMENTS=true and MOCK_PAYMENTS_CONFIRM=I_UNDERSTAND_NO_REAL_MONEY, or PAYMENT_PROVIDER=razorpay with test keys.",
      );
    }
  }

  const mock = new MockPaymentProvider({
    webhookSecret: resolveMockWebhookSecret(),
  });
  cached = mock;
  return mock;
}

/** Test-only override. */
export function setPaymentProviderForTests(provider: PaymentProvider | null) {
  cached = provider;
}

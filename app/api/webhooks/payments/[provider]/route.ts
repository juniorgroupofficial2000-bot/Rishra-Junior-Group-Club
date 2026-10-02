import { getPaymentProvider, getPaymentProviderName } from "@/server/payments/factory";
import {
  processProviderWebhook,
  WebhookSignatureError,
} from "@/server/payments/webhook-processor";
import { paymentLog } from "@/server/payments/logging";
import { consumeRateLimit } from "@/server/security/rate-limit";
import { prisma } from "@/server/db/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ provider: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { provider: providerParam } = await context.params;
  const configured = getPaymentProviderName();

  // Only the configured provider path is accepted — never a always-on /mock bypass.
  if (providerParam !== configured) {
    paymentLog.warn("webhook_provider_mismatch", {
      pathProvider: providerParam,
      configured,
    });
    return NextResponse.json({ error: "Unknown provider." }, { status: 404 });
  }

  const clientKey =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (!consumeRateLimit(`webhook:${configured}:${clientKey}`, 120, 60_000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const rawBody = await request.text();
  if (rawBody.length > 256_000) {
    return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  }

  const signatureHeader =
    request.headers.get("x-razorpay-signature") ??
    request.headers.get("x-webhook-signature") ??
    request.headers.get("x-payment-signature");

  let provider;
  try {
    provider = getPaymentProvider();
  } catch (error) {
    paymentLog.error("webhook_provider_unavailable", {
      error: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json(
      { error: "Payment provider unavailable." },
      { status: 503 },
    );
  }

  try {
    const result = await processProviderWebhook({
      prisma,
      provider,
      rawBody,
      signatureHeader,
    });

    if (result.status === "duplicate") {
      return NextResponse.json({ ok: true, duplicate: true }, { status: 200 });
    }
    if (result.status === "failed") {
      return NextResponse.json(
        { ok: false, error: "Webhook processing failed." },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    if (error instanceof WebhookSignatureError) {
      return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
    }
    paymentLog.error("webhook_route_error", {
      error: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json({ error: "Webhook failed." }, { status: 500 });
  }
}

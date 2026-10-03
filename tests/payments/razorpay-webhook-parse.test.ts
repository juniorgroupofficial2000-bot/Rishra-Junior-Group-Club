import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { RazorpayPaymentProvider } from "@/server/payments/razorpay-provider";

describe("Razorpay webhook parsing", () => {
  const secret = "whsec_test_parse";
  const provider = new RazorpayPaymentProvider({
    keyId: "rzp_test_parse",
    keySecret: "secret",
    webhookSecret: secret,
    mode: "test",
  });

  function sign(body: string) {
    return createHmac("sha256", secret).update(body).digest("hex");
  }

  it("extracts payment id from subscription.charged nested payment entity", async () => {
    const rawBody = JSON.stringify({
      event: "subscription.charged",
      created_at: 1_700_000_000,
      payload: {
        subscription: {
          entity: {
            id: "sub_abc",
            status: "active",
            amount: 50000,
          },
        },
        payment: {
          entity: {
            id: "pay_nested_123",
            order_id: "order_nested_9",
            status: "captured",
            amount: 50000,
            subscription_id: "sub_abc",
          },
        },
      },
    });

    const event = await provider.verifyWebhook({
      rawBody,
      signatureHeader: sign(rawBody),
    });

    expect(event.paymentRef).toBe("pay_nested_123");
    expect(event.orderRef).toBe("order_nested_9");
    expect(event.subscriptionRef).toBe("sub_abc");
    expect(event.paymentStatus).toBe("SUCCESS");
    expect(event.mandateStatus).toBe("ACTIVE");
    expect(event.amountPaise).toBe(50000);
  });

  it("rejects invalid signatures", async () => {
    const rawBody = JSON.stringify({
      event: "payment.captured",
      payload: { payment: { entity: { id: "pay_x", status: "captured" } } },
    });
    await expect(
      provider.verifyWebhook({
        rawBody,
        signatureHeader: "deadbeef",
      }),
    ).rejects.toThrow(/Invalid Razorpay webhook signature/);
  });
});

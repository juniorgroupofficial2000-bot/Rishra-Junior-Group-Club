import { describe, expect, it } from "vitest";
import { NotificationService } from "@/server/notifications/service";
import { buildNotificationPayload } from "@/server/notifications/templates";
import {
  NotificationEvents,
  type NotificationChannel,
  type NotificationPayload,
} from "@/server/notifications/types";

class CapturingChannel implements NotificationChannel {
  readonly name = "email" as const;
  sent: NotificationPayload[] = [];
  async send(payload: NotificationPayload) {
    this.sent.push(payload);
    return { event: payload.event, channel: this.name, ok: true };
  }
}

describe("NotificationService", () => {
  it("builds payloads for all operational events", () => {
    const events = Object.values(NotificationEvents);
    for (const event of events) {
      const payload = buildNotificationPayload(event, {
        recipient: {
          userId: "user_1",
          email: "a@example.com",
          displayName: "Demo",
        },
        data: {
          amountLabel: "₹100.00",
          nextDebitOn: "2026-05-01",
          eventTitle: "Sample event",
          startsAt: "2026-05-01T10:00:00Z",
          announcementTitle: "Hello",
        },
      });
      expect(payload.event).toBe(event);
      expect(payload.title.length).toBeGreaterThan(0);
      expect(payload.body.length).toBeGreaterThan(0);
    }
  });

  it("dispatches to configured future providers without exposing secrets", async () => {
    const email = new CapturingChannel();
    const service = new NotificationService([email]);
    const results = await service.dispatch({
      event: NotificationEvents.PAYMENT_FAILED,
      recipient: {
        email: "member@rjgc.local",
        displayName: "Demo",
      },
      title: "Payment failed",
      body: "A debit failed.",
      channels: ["email"],
      data: {
        // Ensure operational payloads stay non-sensitive
        amountLabel: "₹50.00",
        failureCode: "DECLINED",
      },
    });

    expect(results[0]?.ok).toBe(true);
    expect(email.sent[0]?.data?.amountLabel).toBe("₹50.00");
    expect(JSON.stringify(email.sent[0])).not.toMatch(/cvv|password|upiPin/i);
  });
});

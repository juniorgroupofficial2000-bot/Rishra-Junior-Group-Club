import { isProductionRuntime } from "@/server/security/env";
import type {
  NotificationChannel,
  NotificationDispatchResult,
  NotificationPayload,
} from "@/server/notifications/types";

function logSend(
  channel: NotificationChannel["name"],
  payload: NotificationPayload,
): NotificationDispatchResult {
  // Never claim successful delivery in production — console is not a real provider.
  if (isProductionRuntime()) {
    console.warn(
      JSON.stringify({
        scope: "notifications",
        channel,
        event: payload.event,
        ok: false,
        error: "Console notification channel is disabled in production.",
      }),
    );
    return {
      event: payload.event,
      channel,
      ok: false,
      error: "Console notification channel is disabled in production.",
    };
  }

  console.info(
    JSON.stringify({
      scope: "notifications",
      channel,
      event: payload.event,
      to: {
        userId: payload.recipient.userId ?? null,
        email: payload.recipient.email ? "[present]" : null,
        phone: payload.recipient.phone ? "[present]" : null,
      },
      title: payload.title,
      delivery: "console-only",
    }),
  );
  return {
    event: payload.event,
    channel,
    ok: true,
    providerMessageId: `${channel}_console_${Date.now()}`,
  };
}

/** Dev/test placeholder — not a production email provider. */
export class ConsoleEmailChannel implements NotificationChannel {
  readonly name = "email" as const;
  async send(payload: NotificationPayload) {
    if (!payload.recipient.email) {
      return {
        event: payload.event,
        channel: this.name,
        ok: false,
        error: "Missing email",
      };
    }
    return logSend(this.name, payload);
  }
}

/** Dev/test placeholder — not a production SMS provider. */
export class ConsoleSmsChannel implements NotificationChannel {
  readonly name = "sms" as const;
  async send(payload: NotificationPayload) {
    if (!payload.recipient.phone) {
      return {
        event: payload.event,
        channel: this.name,
        ok: false,
        error: "Missing phone",
      };
    }
    return logSend(this.name, payload);
  }
}

/** Dev/test placeholder — not a production WhatsApp provider. */
export class ConsoleWhatsAppChannel implements NotificationChannel {
  readonly name = "whatsapp" as const;
  async send(payload: NotificationPayload) {
    if (!payload.recipient.phone) {
      return {
        event: payload.event,
        channel: this.name,
        ok: false,
        error: "Missing phone",
      };
    }
    return logSend(this.name, payload);
  }
}

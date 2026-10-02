import type {
  NotificationChannel,
  NotificationDispatchResult,
  NotificationPayload,
} from "@/server/notifications/types";

function logSend(
  channel: NotificationChannel["name"],
  payload: NotificationPayload,
): NotificationDispatchResult {
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
    }),
  );
  return {
    event: payload.event,
    channel,
    ok: true,
    providerMessageId: `${channel}_console_${Date.now()}`,
  };
}

/** Future email provider adapter placeholder (SendGrid/SES/etc.). */
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

/** Future SMS provider adapter placeholder (MSG91/Twilio/etc.). */
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

/** Future WhatsApp provider adapter placeholder. */
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

import "server-only";

import { prisma } from "@/server/db/prisma";
import {
  ConsoleEmailChannel,
  ConsoleSmsChannel,
  ConsoleWhatsAppChannel,
} from "@/server/notifications/channels/console-channels";
import { ResendEmailChannel } from "@/server/notifications/channels/resend-email-channel";
import { buildNotificationPayload } from "@/server/notifications/templates";
import type {
  NotificationChannel,
  NotificationChannelName,
  NotificationDispatchResult,
  NotificationEventName,
  NotificationPayload,
  NotificationRecipient,
} from "@/server/notifications/types";
import type { NotificationType } from "@prisma/client";
import { isProductionRuntime } from "@/server/security/env";

/**
 * NotificationService abstraction.
 * Persists in-app notifications and dispatches to future email/SMS/WhatsApp providers.
 */
export class NotificationService {
  constructor(private readonly channels: NotificationChannel[]) {}

  async notifyEvent(input: {
    event: NotificationEventName;
    recipient: NotificationRecipient;
    data?: NotificationPayload["data"];
    channels?: NotificationChannelName[];
  }): Promise<NotificationDispatchResult[]> {
    const payload = buildNotificationPayload(input.event, {
      recipient: input.recipient,
      data: input.data,
    });
    if (input.channels) {
      payload.channels = input.channels;
    }
    return this.dispatch(payload);
  }

  async dispatch(
    payload: NotificationPayload,
  ): Promise<NotificationDispatchResult[]> {
    const requested = new Set(payload.channels ?? ["in_app"]);
    const results: NotificationDispatchResult[] = [];

    if (requested.has("in_app") && payload.recipient.userId) {
      results.push(await this.persistInApp(payload));
    }

    for (const channel of this.channels) {
      if (!requested.has(channel.name)) continue;
      try {
        results.push(await channel.send(payload));
      } catch (error) {
        results.push({
          event: payload.event,
          channel: channel.name,
          ok: false,
          error: error instanceof Error ? error.message : "Channel failed",
        });
      }
    }

    return results;
  }

  private async persistInApp(
    payload: NotificationPayload,
  ): Promise<NotificationDispatchResult> {
    if (!payload.recipient.userId) {
      return {
        event: payload.event,
        channel: "in_app",
        ok: false,
        error: "Missing userId",
      };
    }

    const row = await prisma.notification.create({
      data: {
        userId: payload.recipient.userId,
        type: mapEventToType(payload.event),
        title: payload.title,
        body: payload.body,
      },
    });

    return {
      event: payload.event,
      channel: "in_app",
      ok: true,
      providerMessageId: row.id,
    };
  }
}

function mapEventToType(event: NotificationEventName): NotificationType {
  if (event.startsWith("payment.") || event.startsWith("mandate.")) {
    return "PAYMENT";
  }
  if (event.startsWith("event.")) return "EVENT";
  if (event.startsWith("membership.")) return "MEMBERSHIP";
  if (event.startsWith("announcement.")) return "ANNOUNCEMENT";
  return "SYSTEM";
}

let singleton: NotificationService | null = null;

function buildDefaultChannels(): NotificationChannel[] {
  const emailProvider = process.env.EMAIL_PROVIDER?.trim().toLowerCase();
  const appEnv = (process.env.APP_ENV ?? process.env.NEXT_PUBLIC_APP_ENV ?? "")
    .trim()
    .toLowerCase();

  // LOCAL: prefer console logging — never accidental Resend to members.
  if (appEnv === "local" && emailProvider !== "resend") {
    return [
      new ConsoleEmailChannel(),
      new ConsoleSmsChannel(),
      new ConsoleWhatsAppChannel(),
    ];
  }

  const hasResend =
    emailProvider === "resend" ||
    Boolean(process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim());

  if (hasResend) {
    // ResendEmailChannel enforces allowlist/redirect outside production.
    return [
      new ResendEmailChannel(),
      new ConsoleSmsChannel(),
      new ConsoleWhatsAppChannel(),
    ];
  }

  if (isProductionRuntime()) {
    // Fail closed: no silent console "success" for payment emails.
    return [new ConsoleSmsChannel(), new ConsoleWhatsAppChannel()];
  }

  return [
    new ConsoleEmailChannel(),
    new ConsoleSmsChannel(),
    new ConsoleWhatsAppChannel(),
  ];
}

export function getNotificationService(): NotificationService {
  if (!singleton) {
    singleton = new NotificationService(buildDefaultChannels());
  }
  return singleton;
}

/** Test helper */
export function setNotificationServiceForTests(
  service: NotificationService | null,
) {
  singleton = service;
}

export async function resolveMemberRecipient(memberId: string) {
  const member = await prisma.member.findFirst({
    where: { id: memberId, deletedAt: null },
    select: {
      id: true,
      userId: true,
      email: true,
      phone: true,
      displayName: true,
    },
  });
  if (!member) return null;
  return {
    userId: member.userId,
    email: member.email,
    phone: member.phone,
    displayName: member.displayName,
  } satisfies NotificationRecipient;
}

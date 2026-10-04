import "server-only";

import { resolveAppEnv } from "@/config/app-env";
import { resolveOutboundEmailAddress } from "@/config/isolation";
import type {
  NotificationChannel,
  NotificationDispatchResult,
  NotificationPayload,
} from "@/server/notifications/types";
import { appLog } from "@/server/observability/logger";

export { resolveOutboundEmailAddress } from "@/config/isolation";

/**
 * Production email via Resend HTTP API.
 * Non-production applies allowlist / redirect isolation.
 */
export class ResendEmailChannel implements NotificationChannel {
  readonly name = "email" as const;

  async send(payload: NotificationPayload): Promise<NotificationDispatchResult> {
    const intended = payload.recipient.email?.trim();
    if (!intended) {
      return {
        event: payload.event,
        channel: this.name,
        ok: false,
        error: "Missing email",
      };
    }

    const resolved = resolveOutboundEmailAddress(intended);
    if (resolved.blocked) {
      appLog.warn("app", "email_blocked_isolation", {
        event: payload.event,
        reason: "allowlist_or_redirect_required",
      });
      return {
        event: payload.event,
        channel: this.name,
        ok: false,
        error: resolved.blocked,
      };
    }

    const apiKey = process.env.RESEND_API_KEY?.trim();
    const from = process.env.EMAIL_FROM?.trim();
    if (!apiKey || !from) {
      return {
        event: payload.event,
        channel: this.name,
        ok: false,
        error: "RESEND_API_KEY and EMAIL_FROM must be configured.",
      };
    }

    const appEnv = resolveAppEnv();
    const text = resolved.redirected
      ? `[Redirected for ${appEnv} — intended ${intended}]\n\n${payload.body}`
      : payload.body;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [resolved.to],
        subject: resolved.redirected
          ? `[${appEnv}] ${payload.title}`
          : payload.title,
        text,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      return {
        event: payload.event,
        channel: this.name,
        ok: false,
        error: `Resend error ${response.status}${detail ? `: ${detail.slice(0, 180)}` : ""}`,
      };
    }

    const json = (await response.json().catch(() => null)) as {
      id?: string;
    } | null;

    if (resolved.redirected) {
      appLog.info("app", "email_redirected", {
        event: payload.event,
        appEnv,
      });
    }

    return {
      event: payload.event,
      channel: this.name,
      ok: true,
      providerMessageId: json?.id ?? `resend_${Date.now()}`,
    };
  }
}

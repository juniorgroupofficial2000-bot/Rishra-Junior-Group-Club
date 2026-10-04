export type NotificationChannelName = "email" | "sms" | "whatsapp" | "in_app";

export const NotificationEvents = {
  MEMBERSHIP_APPROVED: "membership.approved",
  PAYMENT_SUCCESSFUL: "payment.successful",
  PAYMENT_FAILED: "payment.failed",
  UPCOMING_PAYMENT: "payment.upcoming",
  MANDATE_CREATED: "mandate.created",
  MANDATE_CANCELLED: "mandate.cancelled",
  EVENT_REGISTRATION: "event.registration",
  EVENT_REMINDER: "event.reminder",
  ANNOUNCEMENT_PUBLISHED: "announcement.published",
} as const;

export type NotificationEventName =
  (typeof NotificationEvents)[keyof typeof NotificationEvents];

export type NotificationRecipient = {
  userId?: string | null;
  email?: string | null;
  phone?: string | null;
  displayName?: string | null;
};

export type NotificationPayload = {
  event: NotificationEventName;
  recipient: NotificationRecipient;
  title: string;
  body: string;
  /** Non-sensitive template data only. */
  data?: Record<string, string | number | boolean | null | undefined>;
  channels?: NotificationChannelName[];
};

export type NotificationDispatchResult = {
  event: NotificationEventName;
  channel: NotificationChannelName;
  ok: boolean;
  providerMessageId?: string;
  error?: string;
};

export interface NotificationChannel {
  readonly name: NotificationChannelName;
  send(payload: NotificationPayload): Promise<NotificationDispatchResult>;
}

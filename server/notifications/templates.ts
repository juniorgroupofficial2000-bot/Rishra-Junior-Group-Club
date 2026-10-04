import {
  NotificationEvents,
  type NotificationEventName,
  type NotificationPayload,
  type NotificationRecipient,
} from "@/server/notifications/types";

type TemplateInput = {
  recipient: NotificationRecipient;
  data?: NotificationPayload["data"];
};

export function buildNotificationPayload(
  event: NotificationEventName,
  input: TemplateInput,
): NotificationPayload {
  const name = input.recipient.displayName ?? "Member";
  const data = input.data ?? {};

  switch (event) {
    case NotificationEvents.MEMBERSHIP_APPROVED:
      return {
        event,
        recipient: input.recipient,
        title: "Membership approved",
        body: `Hi ${name}, your membership has been approved.`,
        data,
        channels: ["in_app", "email"],
      };
    case NotificationEvents.PAYMENT_SUCCESSFUL:
      return {
        event,
        recipient: input.recipient,
        title: "Payment successful",
        body: `Hi ${name}, a payment of ${data.amountLabel ?? "dues"} was confirmed.`,
        data,
        channels: ["in_app", "email", "sms"],
      };
    case NotificationEvents.PAYMENT_FAILED:
      return {
        event,
        recipient: input.recipient,
        title: "Payment failed",
        body: `Hi ${name}, a recent payment attempt failed. Please review your mandate or contact the treasurer.`,
        data,
        channels: ["in_app", "email", "sms", "whatsapp"],
      };
    case NotificationEvents.UPCOMING_PAYMENT:
      return {
        event,
        recipient: input.recipient,
        title: "Upcoming payment",
        body: `Hi ${name}, a debit is scheduled for ${data.nextDebitOn ?? "soon"}.`,
        data,
        channels: ["in_app", "email"],
      };
    case NotificationEvents.MANDATE_CREATED:
      return {
        event,
        recipient: input.recipient,
        title: "Mandate created",
        body: `Hi ${name}, your recurring mandate setup has started. Activation requires provider confirmation.`,
        data,
        channels: ["in_app", "email"],
      };
    case NotificationEvents.MANDATE_CANCELLED:
      return {
        event,
        recipient: input.recipient,
        title: "Mandate cancelled",
        body: `Hi ${name}, your recurring mandate has been cancelled.`,
        data,
        channels: ["in_app", "email", "sms"],
      };
    case NotificationEvents.EVENT_REGISTRATION:
      return {
        event,
        recipient: input.recipient,
        title: "Event registration confirmed",
        body: `Hi ${name}, you are registered for ${data.eventTitle ?? "the event"}.`,
        data,
        channels: ["in_app", "email"],
      };
    case NotificationEvents.EVENT_REMINDER:
      return {
        event,
        recipient: input.recipient,
        title: "Event reminder",
        body: `Hi ${name}, reminder: ${data.eventTitle ?? "an event"} starts ${data.startsAt ?? "soon"}.`,
        data,
        channels: ["in_app", "email", "whatsapp"],
      };
    case NotificationEvents.ANNOUNCEMENT_PUBLISHED:
      return {
        event,
        recipient: input.recipient,
        title: "New announcement",
        body: String(data.announcementTitle ?? "A new club announcement was published."),
        data,
        channels: ["in_app", "email"],
      };
    default:
      return {
        event,
        recipient: input.recipient,
        title: "Club notification",
        body: `Hi ${name}, you have a new club update.`,
        data,
        channels: ["in_app"],
      };
  }
}

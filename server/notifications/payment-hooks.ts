import "server-only";

import { AuditActions } from "@/server/audit/actions";
import { prisma } from "@/server/db/prisma";
import {
  getNotificationService,
  resolveMemberRecipient,
} from "@/server/notifications/service";
import { NotificationEvents } from "@/server/notifications/types";
import { formatAmountLabel } from "@/server/repositories/prisma/mappers";
import { writeAuditEvent } from "@/server/services/audit-service";
import type { VerifiedWebhookEvent } from "@/server/payments/types";

/**
 * Side effects after a verified webhook is persisted.
 * Keeps notifications/audit outside the DB transaction for retry safety.
 */
export async function notifyFromVerifiedWebhook(
  event: VerifiedWebhookEvent,
) {
  if ((event.paymentRef || event.orderRef) && event.paymentStatus) {
    const payment = await prisma.payment.findFirst({
      where: {
        deletedAt: null,
        OR: [
          ...(event.paymentRef
            ? [{ providerPaymentRef: event.paymentRef }]
            : []),
          ...(event.orderRef ? [{ providerOrderRef: event.orderRef }] : []),
        ],
      },
    });
    if (payment) {
      await writeAuditEvent({
        actorUserId: null,
        action: AuditActions.PAYMENT_UPDATED,
        entityType: "Payment",
        entityId: payment.id,
        metadata: {
          status: event.paymentStatus,
          providerPaymentRef: event.paymentRef ?? null,
          providerOrderRef: event.orderRef ?? null,
          eventType: event.eventType,
        },
      });

      const recipient = await resolveMemberRecipient(payment.memberId);
      if (recipient) {
        if (event.paymentStatus === "SUCCESS") {
          await getNotificationService().notifyEvent({
            event: NotificationEvents.PAYMENT_SUCCESSFUL,
            recipient,
            data: {
              amountLabel: formatAmountLabel(
                payment.amountPaise,
                payment.currency,
              ),
            },
          });
        }
        if (event.paymentStatus === "FAILED") {
          await getNotificationService().notifyEvent({
            event: NotificationEvents.PAYMENT_FAILED,
            recipient,
            data: {
              amountLabel: formatAmountLabel(
                payment.amountPaise,
                payment.currency,
              ),
              failureCode: event.failureCode ?? null,
            },
          });
        }
      }
    }
  }

  if (event.mandateRef && event.mandateStatus === "CANCELLED") {
    const mandate = await prisma.paymentMandate.findFirst({
      where: {
        deletedAt: null,
        OR: [
          { providerMandateRef: event.mandateRef },
          { providerSubscriptionRef: event.mandateRef },
        ],
      },
    });
    if (mandate) {
      await writeAuditEvent({
        actorUserId: null,
        action: AuditActions.MANDATE_CANCELLED,
        entityType: "PaymentMandate",
        entityId: mandate.id,
        metadata: {
          providerMandateRef: event.mandateRef,
          eventType: event.eventType,
        },
      });
      const recipient = await resolveMemberRecipient(mandate.memberId);
      if (recipient) {
        await getNotificationService().notifyEvent({
          event: NotificationEvents.MANDATE_CANCELLED,
          recipient,
        });
      }
    }
  }

  if (
    event.mandateRef &&
    event.eventType === "recurring.debit.failed"
  ) {
    const mandate = await prisma.paymentMandate.findFirst({
      where: {
        deletedAt: null,
        OR: [
          { providerMandateRef: event.mandateRef },
          { providerSubscriptionRef: event.mandateRef },
        ],
      },
    });
    if (mandate) {
      const recipient = await resolveMemberRecipient(mandate.memberId);
      if (recipient) {
        await getNotificationService().notifyEvent({
          event: NotificationEvents.PAYMENT_FAILED,
          recipient,
          data: {
            amountLabel:
              mandate.amountPaise != null
                ? formatAmountLabel(mandate.amountPaise, mandate.currency)
                : "dues",
            failureCode: event.failureCode ?? null,
          },
        });
      }
    }
  }
}

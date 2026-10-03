import { adminUpdateMemberAction } from "@/app/(admin)/actions/members";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBanner } from "@/components/admin/admin-status-banner";
import { MemberDeleteButton } from "@/components/admin/member-delete-button";
import { MemberDetailTabs } from "@/components/admin/member-detail-tabs";
import { MemberLifecycleActions } from "@/components/admin/member-lifecycle-actions";
import { DigitalMembershipCard } from "@/components/membership/digital-membership-card";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea } from "@/components/ui/input";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import { membershipQrDataUrl } from "@/lib/membership/qr";
import { memberStatusLabel } from "@/server/domain/member-lifecycle";
import { hasPermission, Permissions } from "@/server/domain/permissions";
import { requirePermission } from "@/server/auth/session";
import { loadAdminMemberDetail } from "@/server/services/member-detail-service";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Member detail",
  robots: { index: false, follow: false },
};

export default async function AdminMemberDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; updated?: string }>;
}) {
  const session = await requirePermission(
    Permissions.MEMBERS_READ,
    "/admin/members",
  );
  const { id } = await params;
  const query = await searchParams;

  let detail;
  try {
    detail = await loadAdminMemberDetail(id);
  } catch {
    notFound();
  }

  const { member, payments, attendance, events, activity, card } = detail;
  const canWrite = hasPermission(session.user.role, Permissions.MEMBERS_WRITE);
  const canStatus = hasPermission(session.user.role, Permissions.MEMBERS_STATUS);
  const canDelete = hasPermission(session.user.role, Permissions.MEMBERS_DELETE);
  const qrDataUrl = card ? await membershipQrDataUrl(card.verifyUrl) : null;

  return (
    <>
      <AdminPageHeader
        title={member.displayName}
        description={`${member.membershipNumber} · ${memberStatusLabel(member.status)}`}
        actions={
          <Link
            href="/admin/members"
            className="inline-flex min-h-11 items-center rounded-md border border-border-default px-3 text-sm font-medium text-ink-800 hover:bg-ink-50"
          >
            Back to members
          </Link>
        }
      />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {query.error ? (
          <AdminStatusBanner tone="error">{query.error}</AdminStatusBanner>
        ) : null}
        {query.updated ? (
          <AdminStatusBanner tone="success">
            Changes saved ({query.updated}). An audit event was recorded.
          </AdminStatusBanner>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline">{memberStatusLabel(member.status)}</Badge>
          {member.isSample ? (
            <Badge variant="neutral">SAMPLE / fictional</Badge>
          ) : null}
          <p className="font-mono text-sm text-ink-500">
            {member.membershipNumber}
          </p>
          <p className="text-sm text-ink-500">{member.email}</p>
        </div>

        <MemberDetailTabs
          panels={{
            Profile: (
              <section className="space-y-4 rounded-xl border border-border-subtle bg-surface-raised p-5 shadow-xs">
                {canWrite ? (
                  <form
                    action={adminUpdateMemberAction}
                    className="grid gap-4 sm:grid-cols-2"
                  >
                    <input type="hidden" name="memberId" value={member.id} />
                    <Input
                      id="firstName"
                      name="firstName"
                      label="First name"
                      defaultValue={member.firstName}
                      required
                    />
                    <Input
                      id="lastName"
                      name="lastName"
                      label="Last name"
                      defaultValue={member.lastName}
                      required
                    />
                    <Input
                      id="displayName"
                      name="displayName"
                      label="Display name"
                      defaultValue={member.displayName}
                      required
                      className="sm:col-span-2"
                    />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      label="Email"
                      defaultValue={member.email}
                      required
                    />
                    <Input
                      id="phone"
                      name="phone"
                      label="Phone"
                      defaultValue={member.phone ?? ""}
                    />
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      label="Date of birth"
                      defaultValue={
                        member.dateOfBirth
                          ? member.dateOfBirth.toISOString().slice(0, 10)
                          : ""
                      }
                    />
                    <Input
                      id="addressLine1"
                      name="addressLine1"
                      label="Address line 1"
                      defaultValue={member.addressLine1 ?? ""}
                    />
                    <Input
                      id="addressLine2"
                      name="addressLine2"
                      label="Address line 2"
                      defaultValue={member.addressLine2 ?? ""}
                    />
                    <Input
                      id="city"
                      name="city"
                      label="City"
                      defaultValue={member.city ?? ""}
                    />
                    <Input
                      id="state"
                      name="state"
                      label="State"
                      defaultValue={member.state ?? ""}
                    />
                    <Input
                      id="postalCode"
                      name="postalCode"
                      label="Postal code"
                      defaultValue={member.postalCode ?? ""}
                    />
                    <Input
                      id="emergencyContactName"
                      name="emergencyContactName"
                      label="Emergency contact name"
                      defaultValue={member.emergencyContactName ?? ""}
                    />
                    <Input
                      id="emergencyContactPhone"
                      name="emergencyContactPhone"
                      label="Emergency contact phone"
                      defaultValue={member.emergencyContactPhone ?? ""}
                    />
                    <Textarea
                      id="internalNotes"
                      name="internalNotes"
                      label="Internal notes"
                      defaultValue={member.internalNotes ?? ""}
                      className="sm:col-span-2"
                    />
                    <div className="sm:col-span-2">
                      <PendingSubmitButton pendingLabel="Saving…">
                        Save profile
                      </PendingSubmitButton>
                    </div>
                  </form>
                ) : (
                  <dl className="grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-ink-500">Phone</dt>
                      <dd className="font-medium">{member.phone ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-ink-500">City</dt>
                      <dd className="font-medium">{member.city ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-ink-500">Emergency contact</dt>
                      <dd className="font-medium">
                        {member.emergencyContactName ?? "—"}
                        {member.emergencyContactPhone
                          ? ` · ${member.emergencyContactPhone}`
                          : ""}
                      </dd>
                    </div>
                  </dl>
                )}
              </section>
            ),
            Membership: (
              <section className="space-y-6">
                <div className="rounded-xl border border-border-subtle bg-surface-raised p-5 shadow-xs">
                  <h2 className="font-display text-lg font-semibold">
                    Membership summary
                  </h2>
                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-ink-500">Membership ID</dt>
                      <dd className="font-mono font-medium">
                        {member.membershipNumber}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-ink-500">Status</dt>
                      <dd className="font-medium">
                        {memberStatusLabel(member.status)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-ink-500">Plan</dt>
                      <dd className="font-medium">
                        {member.currentPlanLabel ?? "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-ink-500">Committee role</dt>
                      <dd className="font-medium">
                        {member.committeeRoleLabel ?? "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-ink-500">Joined</dt>
                      <dd className="font-medium">
                        {member.joinedOn
                          ? member.joinedOn.toISOString().slice(0, 10)
                          : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-ink-500">Created / updated</dt>
                      <dd className="font-medium">
                        {member.createdAt.toISOString().slice(0, 10)} ·{" "}
                        {member.updatedAt.toISOString().slice(0, 10)}
                      </dd>
                    </div>
                    {member.reviewNotes ? (
                      <div className="sm:col-span-2">
                        <dt className="text-ink-500">Review notes</dt>
                        <dd className="font-medium">{member.reviewNotes}</dd>
                      </div>
                    ) : null}
                    {member.statusReason ? (
                      <div className="sm:col-span-2">
                        <dt className="text-ink-500">Last status reason</dt>
                        <dd className="font-medium">{member.statusReason}</dd>
                      </div>
                    ) : null}
                  </dl>
                </div>
                {canStatus ? (
                  <div className="rounded-xl border border-border-subtle bg-surface-raised p-5 shadow-xs">
                    <h2 className="font-display text-lg font-semibold">
                      Lifecycle actions
                    </h2>
                    <p className="mt-1 text-sm text-ink-500">
                      Application → Pending review → Approved → Active →
                      Suspended / Inactive → Archived
                    </p>
                    <div className="mt-4">
                      <MemberLifecycleActions
                        memberId={member.id}
                        status={member.status}
                        displayName={member.displayName}
                      />
                    </div>
                  </div>
                ) : null}
              </section>
            ),
            Payments: (
              <section className="rounded-xl border border-border-subtle bg-surface-raised p-5 shadow-xs">
                {payments.length === 0 ? (
                  <p className="text-sm text-ink-500">
                    Payment history will appear here after the first payment.
                  </p>
                ) : (
                  <ul className="divide-y divide-border-subtle text-sm">
                    {payments.map((payment) => (
                      <li
                        key={payment.id}
                        className="flex flex-wrap items-center justify-between gap-2 py-3"
                      >
                        <div>
                          <p className="font-medium">{payment.amountLabel}</p>
                          <p className="text-ink-500">{payment.paidOn}</p>
                        </div>
                        <Badge variant="outline">{payment.status}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ),
            Attendance: (
              <section className="rounded-xl border border-border-subtle bg-surface-raised p-5 shadow-xs">
                {attendance.length === 0 ? (
                  <p className="text-sm text-ink-500">
                    No attendance records yet.
                  </p>
                ) : (
                  <ul className="divide-y divide-border-subtle text-sm">
                    {attendance.map((row) => (
                      <li key={row.id} className="py-3">
                        <p className="font-medium">{row.eventTitle}</p>
                        <p className="text-ink-500">
                          {row.occurredOn} · {row.status}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ),
            Events: (
              <section className="rounded-xl border border-border-subtle bg-surface-raised p-5 shadow-xs">
                {events.length === 0 ? (
                  <p className="text-sm text-ink-500">
                    No event registrations yet.
                  </p>
                ) : (
                  <ul className="divide-y divide-border-subtle text-sm">
                    {events.map((event) => (
                      <li key={event.id} className="py-3">
                        <Link
                          href={event.href}
                          className="font-medium underline-offset-4 hover:underline"
                        >
                          {event.title}
                        </Link>
                        <p className="text-ink-500">
                          {event.startsAt} · {event.status}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ),
            Documents: (
              <section className="rounded-xl border border-dashed border-border-strong bg-surface-muted/40 p-5">
                <h2 className="font-display text-lg font-semibold">Documents</h2>
                <p className="mt-2 text-sm text-ink-600">
                  Member document storage is not enabled yet. When the committee
                  opens document uploads, files will appear here.
                </p>
              </section>
            ),
            Activity: (
              <section className="rounded-xl border border-border-subtle bg-surface-raised p-5 shadow-xs">
                {activity.length === 0 ? (
                  <p className="text-sm text-ink-500">
                    No recorded activity for this member yet.
                  </p>
                ) : (
                  <ol className="space-y-4">
                    {activity.map((item) => (
                      <li key={item.id} className="relative pl-4">
                        <span
                          className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-alta-500"
                          aria-hidden
                        />
                        <p className="text-sm font-medium text-ink-900">
                          {item.label}
                        </p>
                        {item.detail ? (
                          <p className="text-sm text-ink-500">{item.detail}</p>
                        ) : null}
                        <p className="font-mono text-xs text-ink-400">
                          {new Date(item.occurredAt).toLocaleString("en-IN")}
                        </p>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            ),
            Card: (
              <section className="max-w-xl space-y-4">
                {card ? (
                  <>
                    <DigitalMembershipCard
                      displayName={card.displayName}
                      membershipNumber={card.membershipNumber}
                      membershipType={card.membershipType}
                      statusLabel={card.statusLabel}
                      joinedOn={card.joinedOn}
                      validThrough={card.validThrough}
                      portraitUrl={card.portraitUrl}
                      qrDataUrl={qrDataUrl}
                    />
                    <p className="text-sm text-ink-500">
                      QR verification URL (no private contact data):{" "}
                      <Link
                        href={card.verifyUrl}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {card.verifyUrl}
                      </Link>
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-ink-500">
                    Digital card is unavailable for this record.
                  </p>
                )}
              </section>
            ),
          }}
        />

        {canDelete ? (
          <section className="rounded-xl border border-alta-100 bg-alta-50/40 p-5">
            <h2 className="font-display text-lg font-semibold text-ink-900">
              Archive member
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-ink-600">
              Archives the membership record and retains financial history.
              Confirmation is required.
            </p>
            <div className="mt-4">
              <MemberDeleteButton memberId={member.id} />
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}

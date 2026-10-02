import {
  adminUpdateMemberAction,
  adminUpdateMemberStatusAction,
} from "@/app/(admin)/actions/members";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { MemberDeleteButton } from "@/components/admin/member-delete-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { hasPermission, Permissions } from "@/server/domain/permissions";
import { requirePermission } from "@/server/auth/session";
import { getMemberForAdmin } from "@/server/services/member-admin-service";
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

  let member;
  try {
    member = await getMemberForAdmin(id);
  } catch {
    notFound();
  }

  const canWrite = hasPermission(session.user.role, Permissions.MEMBERS_WRITE);
  const canStatus = hasPermission(session.user.role, Permissions.MEMBERS_STATUS);
  const canDelete = hasPermission(session.user.role, Permissions.MEMBERS_DELETE);

  return (
    <>
      <AdminPageHeader
        title={member.displayName}
        description={`${member.membershipNumber} · internal admin view`}
        actions={
          <Link
            href="/admin/members"
            className="inline-flex min-h-11 items-center rounded-md border border-border-default px-3 text-sm font-medium text-ink-800 hover:bg-ink-50"
          >
            Back to members
          </Link>
        }
      />
      <div className="space-y-8 p-4 sm:p-6 lg:p-8">
        {query.error ? (
          <p
            role="alert"
            className="rounded-md border border-alta-100 bg-alta-50 px-4 py-3 text-sm text-alta-700"
          >
            {query.error}
          </p>
        ) : null}
        {query.updated ? (
          <p
            role="status"
            className="rounded-md border border-border-subtle bg-surface-muted px-4 py-3 text-sm text-ink-700"
          >
            Changes saved ({query.updated}). An audit event was recorded.
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline">{member.status}</Badge>
          {member.isSample ? (
            <Badge variant="neutral">SAMPLE / fictional</Badge>
          ) : null}
          <p className="text-sm text-ink-500">{member.email}</p>
        </div>

        {canWrite ? (
          <section className="space-y-4 rounded-xl border border-border-subtle bg-surface-raised p-5 shadow-xs">
            <h2 className="font-display text-lg font-semibold text-ink-900">
              Edit profile
            </h2>
            <form action={adminUpdateMemberAction} className="grid gap-4 sm:grid-cols-2">
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
              <Textarea
                id="internalNotes"
                name="internalNotes"
                label="Internal notes"
                defaultValue={member.internalNotes ?? ""}
                className="sm:col-span-2"
              />
              <div className="sm:col-span-2">
                <Button type="submit">Save changes</Button>
              </div>
            </form>
          </section>
        ) : (
          <section className="rounded-xl border border-border-subtle bg-surface-raised p-5 shadow-xs">
            <h2 className="font-display text-lg font-semibold text-ink-900">
              Profile
            </h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-ink-500">Plan</dt>
                <dd className="font-medium">{member.currentPlanLabel ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-ink-500">Phone</dt>
                <dd className="font-medium">{member.phone ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-ink-500">City</dt>
                <dd className="font-medium">{member.city ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-ink-500">State</dt>
                <dd className="font-medium">{member.state ?? "—"}</dd>
              </div>
            </dl>
          </section>
        )}

        {canStatus ? (
          <section className="space-y-4 rounded-xl border border-border-subtle bg-surface-raised p-5 shadow-xs">
            <h2 className="font-display text-lg font-semibold text-ink-900">
              Status management
            </h2>
            <form action={adminUpdateMemberStatusAction} className="grid gap-4 sm:grid-cols-[12rem_1fr_auto]">
              <input type="hidden" name="memberId" value={member.id} />
              <div className="flex flex-col gap-1.5">
                <label htmlFor="status" className="text-sm font-medium text-ink-800">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={member.status}
                  className="h-11 rounded-md border border-border-default bg-surface-raised px-3 text-sm"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PENDING">PENDING</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>
              <Input
                id="reason"
                name="reason"
                label="Reason (optional)"
                placeholder="Recorded in audit metadata"
              />
              <div className="flex items-end">
                <Button type="submit">Update status</Button>
              </div>
            </form>
          </section>
        ) : null}

        {canDelete ? (
          <section className="rounded-xl border border-alta-100 bg-alta-50/40 p-5">
            <h2 className="font-display text-lg font-semibold text-ink-900">
              Destructive actions
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-ink-600">
              Soft-delete hides the member from active lists. Confirmation is
              required. Permission checks run on the server.
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

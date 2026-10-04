import {
  createMemberAndAssignAction,
  removeCommitteeMembershipAction,
  reorderMembershipsAction,
  saveCommitteeMembershipAction,
} from "@/app/(admin)/actions/committees";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBanner } from "@/components/admin/admin-status-banner";
import { designationSelectOptions } from "@/components/admin/committee-form";
import { ReorderableList } from "@/components/admin/reorderable-list";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea } from "@/components/ui/input";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { designationLabel } from "@/server/domain/committee-designations";
import { requirePermission } from "@/server/auth/session";
import { Permissions } from "@/server/domain/permissions";
import {
  OrgCommitteeError,
  getAdminCommittee,
  searchMembersForCommitteeAssign,
} from "@/server/services/org-committee-service";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Manage committee members",
  robots: { index: false, follow: false },
};

export default async function AdminCommitteeMembersPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
    updated?: string;
    q?: string;
  }>;
}) {
  await requirePermission(Permissions.COMMITTEE_WRITE, "/admin/committees");
  const { id } = await params;
  const query = await searchParams;

  let committee;
  try {
    committee = await getAdminCommittee(id);
  } catch (error) {
    if (error instanceof OrgCommitteeError) notFound();
    throw error;
  }

  const searchHits = query.q
    ? await searchMembersForCommitteeAssign(query.q)
    : [];
  const designationOptions = designationSelectOptions();

  return (
    <>
      <AdminPageHeader
        title={`Members · ${committee.name}`}
        description="Prefer selecting an existing member so people are not duplicated across committees."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/admin/committees/${committee.id}`}
              className="inline-flex min-h-11 items-center rounded-md border border-border-default px-3 text-sm font-medium hover:bg-ink-50"
            >
              Edit committee
            </Link>
            <Link
              href="/admin/committees"
              className="inline-flex min-h-11 items-center rounded-md border border-border-default px-3 text-sm font-medium hover:bg-ink-50"
            >
              All committees
            </Link>
          </div>
        }
      />
      <div className="space-y-8 p-4 sm:p-6 lg:p-8">
        {query.updated ? (
          <AdminStatusBanner tone="success">{query.updated}</AdminStatusBanner>
        ) : null}
        {query.error ? (
          <AdminStatusBanner tone="error">{query.error}</AdminStatusBanner>
        ) : null}

        <section className="rounded-xl border border-border-subtle bg-surface-raised p-5">
          <h2 className="font-display text-lg font-semibold text-ink-900">
            Current members
          </h2>
          {committee.memberships.length === 0 ? (
            <p className="mt-3 text-sm text-ink-500">
              No members assigned yet.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <Table>
                <THead>
                  <TR>
                    <TH>Member</TH>
                    <TH>Designation</TH>
                    <TH>Order</TH>
                    <TH>Status</TH>
                    <TH>Actions</TH>
                  </TR>
                </THead>
                <TBody>
                  {committee.memberships.map((seat) => (
                    <TR key={seat.id}>
                      <TD>
                        <Link
                          href={`/admin/members/${seat.member.id}`}
                          className="font-medium underline-offset-4 hover:underline"
                        >
                          {seat.member.displayName}
                        </Link>
                        <p className="text-xs text-ink-500">
                          {seat.member.membershipNumber}
                        </p>
                      </TD>
                      <TD>
                        {designationLabel(
                          seat.designation,
                          seat.designationLabel,
                        )}
                      </TD>
                      <TD>{seat.displayOrder}</TD>
                      <TD>
                        <Badge variant="outline">{seat.status}</Badge>
                      </TD>
                      <TD>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <details>
                            <summary className="cursor-pointer font-medium underline-offset-4 hover:underline">
                              Edit
                            </summary>
                            <form
                              action={saveCommitteeMembershipAction}
                              className="mt-3 max-w-sm space-y-2 rounded-md border border-border-subtle p-3"
                            >
                              <input
                                type="hidden"
                                name="committeeId"
                                value={committee.id}
                              />
                              <input
                                type="hidden"
                                name="membershipId"
                                value={seat.id}
                              />
                              <input
                                type="hidden"
                                name="memberId"
                                value={seat.memberId}
                              />
                              <select
                                name="designation"
                                defaultValue={seat.designation}
                                className="min-h-10 w-full rounded-md border border-border-default px-2 text-sm"
                              >
                                {designationOptions.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                              <Input
                                name="designationLabel"
                                defaultValue={seat.designationLabel ?? ""}
                                placeholder="Label override"
                              />
                              <Input
                                name="displayOrder"
                                type="number"
                                defaultValue={seat.displayOrder}
                              />
                              <select
                                name="status"
                                defaultValue={seat.status}
                                className="min-h-10 w-full rounded-md border border-border-default px-2 text-sm"
                              >
                                <option value="PUBLISHED">Published</option>
                                <option value="DRAFT">Draft</option>
                                <option value="ARCHIVED">Archived</option>
                              </select>
                              <Textarea
                                name="shortBio"
                                rows={2}
                                defaultValue={seat.shortBio ?? ""}
                                placeholder="Short bio"
                              />
                              <PendingSubmitButton className="text-sm font-medium underline">
                                Save seat
                              </PendingSubmitButton>
                            </form>
                          </details>
                          <form action={removeCommitteeMembershipAction}>
                            <input
                              type="hidden"
                              name="committeeId"
                              value={committee.id}
                            />
                            <input
                              type="hidden"
                              name="membershipId"
                              value={seat.id}
                            />
                            <button
                              type="submit"
                              className="font-medium text-red-700 underline-offset-4 hover:underline"
                            >
                              Remove
                            </button>
                          </form>
                        </div>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
          )}
        </section>

        {committee.memberships.length > 1 ? (
          <section className="rounded-xl border border-border-subtle bg-surface-raised p-5">
            <h2 className="font-display text-lg font-semibold text-ink-900">
              Reorder members
            </h2>
            <form action={reorderMembershipsAction} className="mt-4 space-y-4">
              <input type="hidden" name="committeeId" value={committee.id} />
              <ReorderableList
                items={committee.memberships.map((seat) => ({
                  id: seat.id,
                  label: seat.member.displayName,
                  meta: designationLabel(
                    seat.designation,
                    seat.designationLabel,
                  ),
                }))}
              />
              <PendingSubmitButton className="inline-flex min-h-11 items-center rounded-md border border-border-default px-3 text-sm font-medium hover:bg-ink-50">
                Save member order
              </PendingSubmitButton>
            </form>
          </section>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border-subtle bg-surface-raised p-5">
            <h2 className="font-display text-lg font-semibold text-ink-900">
              Add existing member
            </h2>
            <form className="mt-4 flex gap-2" method="get">
              <Input
                name="q"
                defaultValue={query.q ?? ""}
                placeholder="Search Rohit Barma…"
                className="flex-1"
              />
              <button
                type="submit"
                className="inline-flex min-h-11 items-center rounded-md border border-border-default px-3 text-sm font-medium hover:bg-ink-50"
              >
                Search
              </button>
            </form>
            <ul className="mt-4 space-y-3">
              {searchHits.map((member) => (
                <li
                  key={member.id}
                  className="rounded-md border border-border-subtle p-3"
                >
                  <p className="font-medium text-ink-900">
                    {member.displayName}
                  </p>
                  <p className="text-xs text-ink-500">
                    {member.membershipNumber} · {member.email}
                  </p>
                  <form
                    action={createMemberAndAssignAction}
                    className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]"
                  >
                    <input
                      type="hidden"
                      name="committeeId"
                      value={committee.id}
                    />
                    <input type="hidden" name="memberId" value={member.id} />
                    <select
                      name="designation"
                      defaultValue="member"
                      className="min-h-10 rounded-md border border-border-default px-2 text-sm"
                    >
                      {designationOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <PendingSubmitButton className="inline-flex min-h-10 items-center rounded-md bg-ink-900 px-3 text-sm font-medium text-white hover:bg-ink-800">
                      Assign
                    </PendingSubmitButton>
                  </form>
                </li>
              ))}
              {query.q && searchHits.length === 0 ? (
                <li className="text-sm text-ink-500">
                  No members matched. Create a new member below.
                </li>
              ) : null}
            </ul>
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface-raised p-5">
            <h2 className="font-display text-lg font-semibold text-ink-900">
              Create new member &amp; assign
            </h2>
            <form
              action={createMemberAndAssignAction}
              className="mt-4 space-y-3"
            >
              <input type="hidden" name="committeeId" value={committee.id} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input name="newFirstName" required placeholder="First name" />
                <Input name="newLastName" required placeholder="Last name" />
              </div>
              <Input
                name="newDisplayName"
                required
                placeholder="Display name"
              />
              <Input
                name="newEmail"
                type="email"
                required
                placeholder="Email"
              />
              <select
                name="designation"
                defaultValue="member"
                className="min-h-11 w-full rounded-md border border-border-default px-2 text-sm"
              >
                {designationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <PendingSubmitButton className="inline-flex min-h-11 items-center rounded-md bg-ink-900 px-3 text-sm font-medium text-white hover:bg-ink-800">
                Create &amp; assign
              </PendingSubmitButton>
            </form>
          </div>
        </section>
      </div>
    </>
  );
}

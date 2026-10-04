"use client";

import { Badge } from "@/components/ui/badge";
import {
  EmptyRecords,
  RecordCard,
  ResponsiveRecords,
} from "@/components/ui/record-card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import Link from "next/link";
import { useMemo, useState } from "react";

export type BulkMemberRow = {
  id: string;
  displayName: string;
  email: string;
  membershipNumber: string;
  statusLabel: string;
  currentPlanLabel: string | null;
  committeeRoleLabel: string | null;
  joinedOn: string | null;
};

export function MembersOpsTable({
  members,
  exportHref,
  canExport,
}: {
  members: BulkMemberRow[];
  exportHref: string;
  canExport: boolean;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allSelected = useMemo(
    () => members.length > 0 && members.every((m) => selected.has(m.id)),
    [members, selected],
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
      return;
    }
    setSelected(new Set(members.map((m) => m.id)));
  }

  const selectedExportHref =
    selected.size > 0
      ? `${exportHref}${exportHref.includes("?") ? "&" : "?"}ids=${[...selected].join(",")}`
      : exportHref;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border-subtle bg-surface-raised px-3 py-2">
        <p className="text-sm text-ink-700">
          {selected.size > 0
            ? `${selected.size} selected on this page`
            : "Select rows to export a subset (safe bulk action)."}
        </p>
        {canExport ? (
          <a
            href={selectedExportHref}
            className="inline-flex min-h-10 items-center rounded-md border border-border-default px-3 text-sm font-medium hover:bg-ink-50"
          >
            {selected.size > 0 ? "Export selected CSV" : "Export filtered CSV"}
          </a>
        ) : null}
      </div>

      <ResponsiveRecords
        mobile={
          members.length === 0 ? (
            <EmptyRecords message="No members match these filters." />
          ) : (
            members.map((member) => (
              <RecordCard
                key={member.id}
                title={member.displayName}
                subtitle={member.email}
                href={`/admin/members/${member.id}`}
                badge={<Badge variant="outline">{member.statusLabel}</Badge>}
                fields={[
                  {
                    label: "Select",
                    value: (
                      <input
                        type="checkbox"
                        checked={selected.has(member.id)}
                        onChange={() => toggle(member.id)}
                        className="size-4 rounded border-border-default"
                        aria-label={`Select ${member.displayName}`}
                      />
                    ),
                  },
                  {
                    label: "Membership ID",
                    value: (
                      <span className="font-mono text-xs">
                        {member.membershipNumber}
                      </span>
                    ),
                  },
                  {
                    label: "Plan",
                    value: member.currentPlanLabel ?? "—",
                  },
                  {
                    label: "Committee",
                    value: member.committeeRoleLabel ?? "—",
                  },
                  {
                    label: "Joined",
                    value: member.joinedOn ?? "—",
                  },
                ]}
              />
            ))
          )
        }
        desktop={
          <Table>
            <THead>
              <TR>
                <TH>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="size-4 rounded border-border-default"
                    aria-label="Select all members on this page"
                  />
                </TH>
                <TH>Member</TH>
                <TH>Membership ID</TH>
                <TH>Status</TH>
                <TH>Plan</TH>
                <TH>Committee</TH>
                <TH>Joined</TH>
              </TR>
            </THead>
            <TBody>
              {members.length === 0 ? (
                <TR>
                  <TD colSpan={7} className="py-8 text-center text-sm text-ink-500">
                    No members match these filters.
                  </TD>
                </TR>
              ) : (
                members.map((member) => (
                  <TR key={member.id}>
                    <TD>
                      <input
                        type="checkbox"
                        checked={selected.has(member.id)}
                        onChange={() => toggle(member.id)}
                        className="size-4 rounded border-border-default"
                        aria-label={`Select ${member.displayName}`}
                      />
                    </TD>
                    <TD>
                      <Link
                        href={`/admin/members/${member.id}`}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {member.displayName}
                      </Link>
                      <p className="text-xs text-ink-500">{member.email}</p>
                    </TD>
                    <TD className="font-mono text-xs">
                      {member.membershipNumber}
                    </TD>
                    <TD>
                      <Badge variant="outline">{member.statusLabel}</Badge>
                    </TD>
                    <TD>{member.currentPlanLabel ?? "—"}</TD>
                    <TD>{member.committeeRoleLabel ?? "—"}</TD>
                    <TD className="text-xs">{member.joinedOn ?? "—"}</TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        }
      />
    </div>
  );
}

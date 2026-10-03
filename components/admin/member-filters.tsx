import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const statuses = [
  "APPLICATION",
  "PENDING",
  "APPROVED",
  "ACTIVE",
  "SUSPENDED",
  "INACTIVE",
  "ARCHIVED",
] as const;

const sortOptions = [
  { value: "updatedAt", label: "Recently updated" },
  { value: "joinedOn", label: "Joined date" },
  { value: "membershipNumber", label: "Membership ID" },
  { value: "displayName", label: "Name" },
  { value: "status", label: "Status" },
] as const;

export function MemberFilters({
  query,
  status,
  planId,
  committeeRole,
  joinedFrom,
  joinedTo,
  sortBy,
  sortDir,
}: {
  query?: string;
  status?: string;
  planId?: string;
  committeeRole?: string;
  joinedFrom?: string;
  joinedTo?: string;
  sortBy?: string;
  sortDir?: string;
}) {
  return (
    <form
      method="get"
      className="grid gap-3 rounded-xl border border-border-subtle bg-surface-raised p-4 shadow-xs sm:grid-cols-2 lg:grid-cols-4"
    >
      <Input
        id="member-query"
        name="query"
        label="Search"
        defaultValue={query ?? ""}
        placeholder="Name, email, membership ID…"
        className="sm:col-span-2"
      />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="member-status" className="text-sm font-medium text-ink-800">
          Status
        </label>
        <select
          id="member-status"
          name="status"
          defaultValue={status ?? ""}
          className="h-11 rounded-md border border-border-default bg-surface-raised px-3 text-sm"
        >
          <option value="">All statuses</option>
          {statuses.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
      <Input
        id="committee-role"
        name="committeeRole"
        label="Committee role"
        defaultValue={committeeRole ?? ""}
        placeholder="e.g. Secretary"
      />
      <Input
        id="plan-id"
        name="planId"
        label="Plan ID"
        defaultValue={planId ?? ""}
        placeholder="Optional plan cuid"
      />
      <Input
        id="joined-from"
        name="joinedFrom"
        type="date"
        label="Joined from"
        defaultValue={joinedFrom ?? ""}
      />
      <Input
        id="joined-to"
        name="joinedTo"
        type="date"
        label="Joined to"
        defaultValue={joinedTo ?? ""}
      />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="sort-by" className="text-sm font-medium text-ink-800">
          Sort by
        </label>
        <select
          id="sort-by"
          name="sortBy"
          defaultValue={sortBy ?? "updatedAt"}
          className="h-11 rounded-md border border-border-default bg-surface-raised px-3 text-sm"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="sort-dir" className="text-sm font-medium text-ink-800">
          Direction
        </label>
        <select
          id="sort-dir"
          name="sortDir"
          defaultValue={sortDir ?? "desc"}
          className="h-11 rounded-md border border-border-default bg-surface-raised px-3 text-sm"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>
      <div className="flex items-end sm:col-span-2 lg:col-span-4">
        <Button type="submit">Apply filters</Button>
      </div>
    </form>
  );
}

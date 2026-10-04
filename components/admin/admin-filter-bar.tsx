import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ReactNode } from "react";

export type AdminFilterField =
  | {
      type: "text";
      name: string;
      label: string;
      defaultValue?: string;
      placeholder?: string;
    }
  | {
      type: "select";
      name: string;
      label: string;
      defaultValue?: string;
      options: Array<{ value: string; label: string }>;
    }
  | {
      type: "date";
      name: string;
      label: string;
      defaultValue?: string;
    };

export function AdminFilterBar({
  fields,
  actions,
}: {
  fields: AdminFilterField[];
  actions?: ReactNode;
}) {
  return (
    <form
      method="get"
      className="grid gap-3 rounded-xl border border-border-subtle bg-surface-raised p-4 shadow-xs sm:grid-cols-2 lg:grid-cols-4"
    >
      {fields.map((field) => {
        if (field.type === "text") {
          return (
            <Input
              key={field.name}
              id={`filter-${field.name}`}
              name={field.name}
              label={field.label}
              defaultValue={field.defaultValue ?? ""}
              placeholder={field.placeholder}
            />
          );
        }
        if (field.type === "date") {
          return (
            <Input
              key={field.name}
              id={`filter-${field.name}`}
              name={field.name}
              type="date"
              label={field.label}
              defaultValue={field.defaultValue ?? ""}
            />
          );
        }
        return (
          <div key={field.name} className="flex flex-col gap-1.5">
            <label
              htmlFor={`filter-${field.name}`}
              className="text-sm font-medium text-ink-800"
            >
              {field.label}
            </label>
            <select
              id={`filter-${field.name}`}
              name={field.name}
              defaultValue={field.defaultValue ?? ""}
              className="h-11 rounded-md border border-border-default bg-surface-raised px-3 text-sm text-ink-900 shadow-xs focus-visible:border-border-focus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            >
              {field.options.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );
      })}
      <div className="flex flex-wrap items-end gap-2 sm:col-span-2 lg:col-span-4">
        <Button type="submit">Apply filters</Button>
        {actions}
      </div>
    </form>
  );
}

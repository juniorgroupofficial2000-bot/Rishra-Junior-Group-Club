import { Input, Textarea } from "@/components/ui/input";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import {
  COMMITTEE_DESIGNATIONS,
  designationLabel,
} from "@/server/domain/committee-designations";
import type { Committee } from "@prisma/client";

export function CommitteeForm({
  action,
  committee,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  committee?: Pick<
    Committee,
    | "id"
    | "name"
    | "slug"
    | "summary"
    | "description"
    | "responsibilities"
    | "iconKey"
    | "coverAssetId"
    | "imageAssetId"
    | "kind"
    | "termStart"
    | "termEnd"
    | "termYear"
    | "status"
    | "displayOrder"
    | "historicallyImportant"
  >;
  submitLabel: string;
}) {
  const dateValue = (value: Date | null | undefined) =>
    value ? value.toISOString().slice(0, 10) : "";

  return (
    <form action={action} className="space-y-5">
      {committee ? <input type="hidden" name="id" value={committee.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="name"
          name="name"
          label="Committee name"
          required
          defaultValue={committee?.name ?? ""}
          placeholder="Animal & Welfare Committee"
          className="sm:col-span-2"
        />
        <Input
          id="slug"
          name="slug"
          label="Slug"
          required
          defaultValue={committee?.slug ?? ""}
          placeholder="animal-welfare"
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="kind" className="text-sm font-medium text-ink-800">
            Kind
          </label>
          <select
            id="kind"
            name="kind"
            defaultValue={committee?.kind ?? "SUB"}
            className="min-h-11 w-full rounded-md border border-border-default bg-white px-3 text-sm"
          >
            <option value="SUB">Sub-committee</option>
            <option value="EXECUTIVE">Executive Committee</option>
          </select>
        </div>
        <Input
          id="summary"
          name="summary"
          label="Short description"
          defaultValue={committee?.summary ?? ""}
          placeholder="Caring beyond the club"
          className="sm:col-span-2"
        />
        <Textarea
          id="description"
          name="description"
          label="Long description"
          rows={4}
          defaultValue={committee?.description ?? ""}
          className="sm:col-span-2"
        />
        <Textarea
          id="responsibilities"
          name="responsibilities"
          label="Responsibilities"
          rows={4}
          defaultValue={committee?.responsibilities ?? ""}
          placeholder="Enter what this committee does. Leave blank if not ready."
          className="sm:col-span-2"
        />
        <Input
          id="iconKey"
          name="iconKey"
          label="Icon key"
          defaultValue={committee?.iconKey ?? ""}
          placeholder="paw-print"
        />
        <Input
          id="displayOrder"
          name="displayOrder"
          type="number"
          min={0}
          label="Display order"
          defaultValue={committee?.displayOrder ?? 0}
        />
        <Input
          id="coverAssetId"
          name="coverAssetId"
          label="Cover asset ID"
          defaultValue={committee?.coverAssetId ?? ""}
          placeholder="Media asset cuid"
        />
        <Input
          id="imageAssetId"
          name="imageAssetId"
          label="Image asset ID"
          defaultValue={committee?.imageAssetId ?? ""}
          placeholder="Media asset cuid"
        />
        <Input
          id="termStart"
          name="termStart"
          type="date"
          label="Term start"
          defaultValue={dateValue(committee?.termStart)}
        />
        <Input
          id="termEnd"
          name="termEnd"
          type="date"
          label="Term end"
          defaultValue={dateValue(committee?.termEnd)}
        />
        <Input
          id="termYear"
          name="termYear"
          type="number"
          min={1990}
          max={2100}
          label="Term year"
          defaultValue={committee?.termYear ?? ""}
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="status" className="text-sm font-medium text-ink-800">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={committee?.status ?? "DRAFT"}
            className="min-h-11 w-full rounded-md border border-border-default bg-white px-3 text-sm"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published (public)</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink-700">
        <input
          type="checkbox"
          name="historicallyImportant"
          defaultChecked={committee?.historicallyImportant ?? false}
          className="h-4 w-4"
        />
        Historically important (blocks hard delete)
      </label>

      <PendingSubmitButton>{submitLabel}</PendingSubmitButton>
    </form>
  );
}

export function designationSelectOptions() {
  return COMMITTEE_DESIGNATIONS.map((key) => ({
    value: key,
    label: designationLabel(key),
  }));
}

import type { ComponentProps, ReactNode } from "react";
import {
  deleteAnnouncementContentAction,
  deleteCommitteePositionAction,
  deleteCommitteeRosterAction,
  deleteEventContentAction,
  deleteFaqItemAction,
  deleteGalleryAlbumAction,
  deleteGalleryMediaAction,
  deleteHomepageBlockAction,
  deletePujaYearAction,
  deleteTimelineEntryAction,
  saveAnnouncementContentAction,
  saveCommitteePositionAction,
  saveCommitteeRosterAction,
  saveEventContentAction,
  saveFaqItemAction,
  saveGalleryAlbumAction,
  saveGalleryMediaAction,
  saveHomepageBlockAction,
  savePujaYearAction,
  saveTimelineEntryAction,
} from "@/app/(admin)/actions/content";
import { ConfirmFormDialog } from "@/components/admin/confirm-form-dialog";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import type { ContentType } from "@/lib/admin/content-types";

const STATUS_OPTIONS = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
const ANNOUNCEMENT_STATUS_OPTIONS = [
  "DRAFT",
  "SCHEDULED",
  "PUBLISHED",
  "ARCHIVED",
] as const;

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-ink-800">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-ink-500">{hint}</span> : null}
    </label>
  );
}

function TextInput(props: ComponentProps<"input">) {
  return (
    <input
      {...props}
      className="min-h-11 w-full rounded-md border border-border-subtle bg-white px-3 py-2 text-sm text-ink-900"
    />
  );
}

function TextArea(props: ComponentProps<"textarea">) {
  return (
    <textarea
      {...props}
      className="min-h-11 w-full rounded-md border border-border-subtle bg-white px-3 py-2 font-mono text-xs text-ink-900"
    />
  );
}

function SelectInput(props: ComponentProps<"select">) {
  return (
    <select
      {...props}
      className="min-h-11 w-full rounded-md border border-border-subtle bg-white px-3 py-2 text-sm text-ink-900"
    />
  );
}

function StatusSelect({
  name = "status",
  defaultValue = "DRAFT",
  options = STATUS_OPTIONS,
}: {
  name?: string;
  defaultValue?: string;
  options?: readonly string[];
}) {
  return (
    <SelectInput name={name} defaultValue={defaultValue}>
      {options.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </SelectInput>
  );
}

function Check({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink-800">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="rounded border-border-subtle"
      />
      {label}
    </label>
  );
}

function jsonDefault(value: unknown) {
  if (value == null) return "";
  return JSON.stringify(value, null, 2);
}

function toLocalInput(value: Date | string | null | undefined) {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type AnyRecord = Record<string, unknown>;

export function ContentEditorForm({
  type,
  record,
  albumOptions = [],
}: {
  type: ContentType;
  record?: AnyRecord | null;
  albumOptions?: Array<{ id: string; title: string }>;
}) {
  const id = typeof record?.id === "string" ? record.id : undefined;
  const isNew = !id;

  const { action, deleteAction, fields } = editorForType(
    type,
    record ?? {},
    albumOptions,
  );

  return (
    <form action={action} className="space-y-5">
      {id ? <input type="hidden" name="id" value={id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">{fields}</div>
      <div className="flex flex-wrap items-center gap-3 border-t border-border-subtle pt-4">
        <PendingSubmitButton pendingLabel={isNew ? "Creating…" : "Saving…"}>
          {isNew ? "Create" : "Save changes"}
        </PendingSubmitButton>
        {!isNew && deleteAction && id ? (
          <ConfirmFormDialog
            title="Delete this content?"
            description="Historically important records cannot be deleted — archive them instead. Soft-delete is audited."
            triggerLabel="Delete"
            confirmLabel="Soft delete"
            action={deleteAction.bind(null, id)}
          />
        ) : null}
      </div>
    </form>
  );
}

function editorForType(
  type: ContentType,
  record: AnyRecord,
  albumOptions: Array<{ id: string; title: string }>,
): {
  action: (formData: FormData) => Promise<void>;
  deleteAction?: (id: string) => Promise<void>;
  fields: ReactNode;
} {
  switch (type) {
    case "homepage":
      return {
        action: saveHomepageBlockAction,
        deleteAction: deleteHomepageBlockAction,
        fields: (
          <>
            <Field label="Key">
              <TextInput
                name="key"
                required
                defaultValue={String(record.key ?? "home.section")}
              />
            </Field>
            <Field label="Title">
              <TextInput
                name="title"
                required
                defaultValue={String(record.title ?? "")}
              />
            </Field>
            <Field label="Status">
              <StatusSelect defaultValue={String(record.status ?? "DRAFT")} />
            </Field>
            <Field label="Sort order">
              <TextInput
                name="sortOrder"
                type="number"
                defaultValue={String(record.sortOrder ?? 0)}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Summary">
                <TextInput
                  name="summary"
                  defaultValue={String(record.summary ?? "")}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field
                label="Body JSON"
                hint="Section payload merged into the homepage."
              >
                <TextArea
                  name="bodyJson"
                  rows={12}
                  required
                  defaultValue={jsonDefault(record.body ?? {})}
                  className="font-mono text-xs"
                />
              </Field>
            </div>
            <Check
              name="historicallyImportant"
              label="Historically important (blocks deletion)"
              defaultChecked={Boolean(record.historicallyImportant)}
            />
          </>
        ),
      };
    case "timeline":
      return {
        action: saveTimelineEntryAction,
        deleteAction: deleteTimelineEntryAction,
        fields: (
          <>
            <Field label="Year label">
              <TextInput
                name="yearLabel"
                required
                defaultValue={String(record.yearLabel ?? "")}
              />
            </Field>
            <Field label="Date (YYYY-MM-DD)">
              <TextInput
                name="date"
                defaultValue={String(record.date ?? "")}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Title">
                <TextInput
                  name="title"
                  required
                  defaultValue={String(record.title ?? "")}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Description">
                <TextArea
                  name="description"
                  rows={5}
                  required
                  defaultValue={String(record.description ?? "")}
                />
              </Field>
            </div>
            <Field label="Status">
              <StatusSelect defaultValue={String(record.status ?? "DRAFT")} />
            </Field>
            <Field label="Provenance">
              <SelectInput
                name="provenance"
                defaultValue={String(record.provenance ?? "placeholder")}
              >
                <option value="verified">verified</option>
                <option value="sample">sample</option>
                <option value="placeholder">placeholder</option>
              </SelectInput>
            </Field>
            <Field label="Sort order">
              <TextInput
                name="sortOrder"
                type="number"
                defaultValue={String(record.sortOrder ?? 0)}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Image JSON (optional)">
                <TextArea
                  name="imageJson"
                  rows={4}
                  defaultValue={jsonDefault(record.imageJson)}
                  className="font-mono text-xs"
                />
              </Field>
            </div>
            <Check
              name="milestone"
              label="Milestone"
              defaultChecked={Boolean(record.milestone)}
            />
            <Check
              name="historicallyImportant"
              label="Historically important"
              defaultChecked={Boolean(record.historicallyImportant)}
            />
            <Check
              name="isSample"
              label="Sample content"
              defaultChecked={Boolean(record.isSample)}
            />
          </>
        ),
      };
    case "faqs":
      return {
        action: saveFaqItemAction,
        deleteAction: deleteFaqItemAction,
        fields: (
          <>
            <div className="sm:col-span-2">
              <Field label="Question">
                <TextInput
                  name="question"
                  required
                  defaultValue={String(record.question ?? "")}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Answer">
                <TextArea
                  name="answer"
                  rows={6}
                  required
                  defaultValue={String(record.answer ?? "")}
                />
              </Field>
            </div>
            <Field label="Status">
              <StatusSelect defaultValue={String(record.status ?? "DRAFT")} />
            </Field>
            <Field label="Sort order">
              <TextInput
                name="sortOrder"
                type="number"
                defaultValue={String(record.sortOrder ?? 0)}
              />
            </Field>
            <Check
              name="historicallyImportant"
              label="Historically important"
              defaultChecked={Boolean(record.historicallyImportant)}
            />
          </>
        ),
      };
    case "puja-years":
      return {
        action: savePujaYearAction,
        deleteAction: deletePujaYearAction,
        fields: (
          <>
            <Field label="Year">
              <TextInput
                name="year"
                type="number"
                required
                defaultValue={String(record.year ?? new Date().getFullYear())}
              />
            </Field>
            <Field label="Title">
              <TextInput
                name="title"
                required
                defaultValue={String(record.title ?? "")}
              />
            </Field>
            <Field label="Theme">
              <TextInput
                name="theme"
                defaultValue={String(record.theme ?? "")}
              />
            </Field>
            <Field label="Starts on">
              <TextInput
                name="startsOn"
                type="datetime-local"
                defaultValue={toLocalInput(
                  record.startsOn as Date | string | null | undefined,
                )}
              />
            </Field>
            <Field label="Ends on">
              <TextInput
                name="endsOn"
                type="datetime-local"
                defaultValue={toLocalInput(
                  record.endsOn as Date | string | null | undefined,
                )}
              />
            </Field>
            <Field label="Location label">
              <TextInput
                name="locationLabel"
                defaultValue={String(record.locationLabel ?? "")}
              />
            </Field>
            <Field label="Location detail">
              <TextInput
                name="locationDetail"
                defaultValue={String(record.locationDetail ?? "")}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Summary">
                <TextArea
                  name="summary"
                  rows={4}
                  required
                  defaultValue={String(record.summary ?? "")}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Committee note">
                <TextArea
                  name="committeeNote"
                  rows={3}
                  defaultValue={String(record.committeeNote ?? "")}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Highlights (one per line)">
                <TextArea
                  name="highlights"
                  rows={4}
                  defaultValue={
                    Array.isArray(record.highlights)
                      ? (record.highlights as string[]).join("\n")
                      : ""
                  }
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field
                label="Schedule JSON"
                hint='Array of {stage,title,description?,startsAt?,endsAt?,sortOrder?,status}. Stages: PREPARATION, DECORATION, PUJA, PUSHPANJALI, CULTURAL, PRASAD, IMMERSION, OTHER. Saving replaces published schedule items.'
              >
                <TextArea
                  name="scheduleJson"
                  rows={8}
                  defaultValue={jsonDefault(
                    Array.isArray(record.scheduleItems)
                      ? (record.scheduleItems as Array<Record<string, unknown>>).map(
                          (item) => ({
                            stage: item.stage,
                            title: item.title,
                            description: item.description ?? null,
                            startsAt: item.startsAt ?? null,
                            endsAt: item.endsAt ?? null,
                            sortOrder: item.sortOrder ?? 0,
                            status: item.status ?? "PUBLISHED",
                          }),
                        )
                      : [],
                  )}
                  className="font-mono text-xs"
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field
                label="Gallery JSON"
                hint='[{id,src,alt,width,height,caption?,category?,provenance}]'
              >
                <TextArea
                  name="galleryJson"
                  rows={6}
                  defaultValue={jsonDefault(record.galleryJson)}
                  className="font-mono text-xs"
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Videos JSON" hint='[{title,url,poster?}]'>
                <TextArea
                  name="videosJson"
                  rows={4}
                  defaultValue={jsonDefault(record.videosJson)}
                  className="font-mono text-xs"
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Documents JSON" hint='[{title,url}]'>
                <TextArea
                  name="documentsJson"
                  rows={4}
                  defaultValue={jsonDefault(record.documentsJson)}
                  className="font-mono text-xs"
                />
              </Field>
            </div>
            <Field label="Status">
              <StatusSelect defaultValue={String(record.status ?? "DRAFT")} />
            </Field>
            <Field label="Provenance">
              <SelectInput
                name="provenance"
                defaultValue={String(record.provenance ?? "placeholder")}
              >
                <option value="verified">verified</option>
                <option value="sample">sample</option>
                <option value="placeholder">placeholder</option>
              </SelectInput>
            </Field>
            <Field label="Sort order">
              <TextInput
                name="sortOrder"
                type="number"
                defaultValue={String(record.sortOrder ?? 0)}
              />
            </Field>
            <Field label="Public path (optional)">
              <TextInput name="href" defaultValue={String(record.href ?? "")} />
            </Field>
            <Field
              label="Cover media asset ID"
              hint="Upload via Admin → Media (purpose PUJA)."
            >
              <TextInput
                name="coverAssetId"
                defaultValue={String(record.coverAssetId ?? "")}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Cover JSON (optional legacy)">
                <TextArea
                  name="coverJson"
                  rows={4}
                  defaultValue={jsonDefault(record.coverJson)}
                  className="font-mono text-xs"
                />
              </Field>
            </div>
            <Check
              name="historicallyImportant"
              label="Historically important"
              defaultChecked={Boolean(record.historicallyImportant)}
            />
            <Check
              name="isSample"
              label="Sample content"
              defaultChecked={Boolean(record.isSample)}
            />
          </>
        ),
      };
    case "committee-roster":
      return {
        action: saveCommitteeRosterAction,
        deleteAction: deleteCommitteeRosterAction,
        fields: (
          <>
            <Field label="Role key">
              <TextInput
                name="roleKey"
                required
                defaultValue={String(record.roleKey ?? "executive_member")}
              />
            </Field>
            <Field label="Role title">
              <TextInput
                name="roleTitle"
                required
                defaultValue={String(record.roleTitle ?? "")}
              />
            </Field>
            <Field label="Name">
              <TextInput
                name="name"
                required
                defaultValue={String(record.name ?? "")}
              />
            </Field>
            <Field label="Familiar name">
              <TextInput
                name="familiarName"
                defaultValue={String(record.familiarName ?? "")}
              />
            </Field>
            <Field label="Display name">
              <TextInput
                name="displayName"
                required
                defaultValue={String(record.displayName ?? "")}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Biography">
                <TextArea
                  name="biography"
                  rows={3}
                  defaultValue={String(record.biography ?? "")}
                />
              </Field>
            </div>
            <Field label="Term year">
              <TextInput
                name="termYear"
                type="number"
                defaultValue={
                  record.termYear != null ? String(record.termYear) : ""
                }
              />
            </Field>
            <Field label="Status">
              <StatusSelect defaultValue={String(record.status ?? "DRAFT")} />
            </Field>
            <Field label="Display order">
              <TextInput
                name="sortOrder"
                type="number"
                defaultValue={String(record.sortOrder ?? 0)}
              />
            </Field>
            <Field label="Position ID (optional)">
              <TextInput
                name="positionId"
                defaultValue={String(record.positionId ?? "")}
              />
            </Field>
            <Field
              label="Portrait media asset ID"
              hint="Upload via Admin → Media (purpose COMMITTEE_PORTRAIT)."
            >
              <TextInput
                name="portraitAssetId"
                defaultValue={String(record.portraitAssetId ?? "")}
              />
            </Field>
            <Check
              name="historicallyImportant"
              label="Historically important"
              defaultChecked={Boolean(record.historicallyImportant)}
            />
          </>
        ),
      };
    case "positions":
      return {
        action: saveCommitteePositionAction,
        deleteAction: deleteCommitteePositionAction,
        fields: (
          <>
            <Field label="Code">
              <TextInput
                name="code"
                required
                defaultValue={String(record.code ?? "")}
              />
            </Field>
            <Field label="Title">
              <TextInput
                name="title"
                required
                defaultValue={String(record.title ?? "")}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Description">
                <TextArea
                  name="description"
                  rows={3}
                  defaultValue={String(record.description ?? "")}
                />
              </Field>
            </div>
            <Field label="Sort order">
              <TextInput
                name="sortOrder"
                type="number"
                defaultValue={String(record.sortOrder ?? 0)}
              />
            </Field>
            <Check
              name="active"
              label="Active"
              defaultChecked={record.active !== false}
            />
            <Check
              name="historicallyImportant"
              label="Historically important"
              defaultChecked={Boolean(record.historicallyImportant)}
            />
          </>
        ),
      };
    case "events":
      return {
        action: saveEventContentAction,
        deleteAction: deleteEventContentAction,
        fields: (
          <>
            <Field label="Slug">
              <TextInput
                name="slug"
                required
                defaultValue={String(record.slug ?? "")}
              />
            </Field>
            <Field label="Title">
              <TextInput
                name="title"
                required
                defaultValue={String(record.title ?? "")}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Description">
                <TextArea
                  name="description"
                  rows={4}
                  defaultValue={String(record.description ?? "")}
                />
              </Field>
            </div>
            <Field label="Starts at">
              <TextInput
                name="startsAt"
                type="datetime-local"
                required
                defaultValue={toLocalInput(
                  record.startsAt as Date | string | undefined,
                )}
              />
            </Field>
            <Field label="Ends at">
              <TextInput
                name="endsAt"
                type="datetime-local"
                defaultValue={toLocalInput(
                  record.endsAt as Date | string | null | undefined,
                )}
              />
            </Field>
            <Field label="Location">
              <TextInput
                name="venueLabel"
                defaultValue={String(record.venueLabel ?? "")}
              />
            </Field>
            <Field label="Category">
              <SelectInput
                name="category"
                defaultValue={String(record.category ?? "event")}
              >
                <option value="event">Event</option>
                <option value="meeting">Meeting</option>
              </SelectInput>
            </Field>
            <Field label="Content status">
              <StatusSelect
                defaultValue={String(record.contentStatus ?? "DRAFT")}
              />
            </Field>
            <Field label="Ops status">
              <SelectInput
                name="opsStatus"
                defaultValue={String(record.status ?? "DRAFT")}
              >
                <option value="DRAFT">DRAFT</option>
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="COMPLETED">COMPLETED</option>
              </SelectInput>
            </Field>
            <Field
              label="Cover media asset ID"
              hint="Upload via Admin → Media (purpose EVENT)."
            >
              <TextInput
                name="coverAssetId"
                defaultValue={String(record.coverAssetId ?? "")}
              />
            </Field>
            <Field label="Capacity (optional)">
              <TextInput
                name="capacity"
                type="number"
                min={1}
                defaultValue={
                  record.capacity != null ? String(record.capacity) : ""
                }
              />
            </Field>
            <Check
              name="registrationRequired"
              label="Member registration required"
              defaultChecked={Boolean(record.registrationRequired)}
            />
            <Check
              name="historicallyImportant"
              label="Historically important"
              defaultChecked={Boolean(record.historicallyImportant)}
            />
            <Check
              name="isSample"
              label="Sample content"
              defaultChecked={Boolean(record.isSample)}
            />
          </>
        ),
      };
    case "announcements":
      return {
        action: saveAnnouncementContentAction,
        deleteAction: deleteAnnouncementContentAction,
        fields: (
          <>
            <Field label="Slug">
              <TextInput
                name="slug"
                required
                defaultValue={String(record.slug ?? "")}
              />
            </Field>
            <Field label="Title">
              <TextInput
                name="title"
                required
                defaultValue={String(record.title ?? "")}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Summary">
                <TextInput
                  name="summary"
                  defaultValue={String(record.summary ?? "")}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Body">
                <TextArea
                  name="body"
                  rows={8}
                  required
                  defaultValue={String(record.body ?? "")}
                />
              </Field>
            </div>
            <Field label="Status">
              <StatusSelect
                defaultValue={String(record.status ?? "DRAFT")}
                options={ANNOUNCEMENT_STATUS_OPTIONS}
              />
            </Field>
            <Field label="Category">
              <SelectInput
                name="category"
                defaultValue={String(record.category ?? "general")}
              >
                <option value="general">general</option>
                <option value="events">events</option>
                <option value="membership">membership</option>
                <option value="puja">puja</option>
                <option value="urgent">urgent</option>
              </SelectInput>
            </Field>
            <Field label="Priority">
              <SelectInput
                name="priority"
                defaultValue={String(record.priority ?? "NORMAL")}
              >
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </SelectInput>
            </Field>
            <Field
              label="Publish date"
              hint="Required when status is Scheduled."
            >
              <TextInput
                name="publishedAt"
                type="datetime-local"
                defaultValue={toLocalInput(
                  record.publishedAt as Date | string | null | undefined,
                )}
              />
            </Field>
            <Field
              label="Cover media asset ID"
              hint="Upload via Admin → Media."
            >
              <TextInput
                name="coverAssetId"
                defaultValue={String(record.coverAssetId ?? "")}
              />
            </Field>
            <Field label="Sort order">
              <TextInput
                name="sortOrder"
                type="number"
                defaultValue={String(record.sortOrder ?? 0)}
              />
            </Field>
            <Check
              name="pinned"
              label="Pinned"
              defaultChecked={Boolean(record.pinned)}
            />
            <Check
              name="historicallyImportant"
              label="Historically important"
              defaultChecked={Boolean(record.historicallyImportant)}
            />
            <Check
              name="isSample"
              label="Sample content"
              defaultChecked={Boolean(record.isSample)}
            />
          </>
        ),
      };
    case "gallery":
      return {
        action: saveGalleryAlbumAction,
        deleteAction: deleteGalleryAlbumAction,
        fields: (
          <>
            <Field label="Slug">
              <TextInput
                name="slug"
                required
                defaultValue={String(record.slug ?? "")}
              />
            </Field>
            <Field label="Title">
              <TextInput
                name="title"
                required
                defaultValue={String(record.title ?? "")}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Description">
                <TextArea
                  name="description"
                  rows={4}
                  defaultValue={String(record.description ?? "")}
                />
              </Field>
            </div>
            <Field label="Content status">
              <StatusSelect
                defaultValue={String(record.contentStatus ?? "DRAFT")}
              />
            </Field>
            <Field label="Year">
              <TextInput
                name="year"
                type="number"
                defaultValue={
                  record.year != null ? String(record.year) : ""
                }
              />
            </Field>
            <Field label="Cover URL">
              <TextInput
                name="coverUrl"
                defaultValue={String(record.coverUrl ?? "")}
              />
            </Field>
            <Field label="Cover alt">
              <TextInput
                name="coverAlt"
                defaultValue={String(record.coverAlt ?? "")}
              />
            </Field>
            <Field label="Sort order">
              <TextInput
                name="sortOrder"
                type="number"
                defaultValue={String(record.sortOrder ?? 0)}
              />
            </Field>
            <Check
              name="historicallyImportant"
              label="Historically important"
              defaultChecked={Boolean(record.historicallyImportant)}
            />
            <Check
              name="isSample"
              label="Sample content"
              defaultChecked={Boolean(record.isSample)}
            />
          </>
        ),
      };
    case "gallery-media":
      return {
        action: saveGalleryMediaAction,
        deleteAction: deleteGalleryMediaAction,
        fields: (
          <>
            <Field label="Album">
              <SelectInput
                name="albumId"
                required
                defaultValue={String(record.albumId ?? albumOptions[0]?.id ?? "")}
              >
                {albumOptions.map((album) => (
                  <option key={album.id} value={album.id}>
                    {album.title}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Type">
              <SelectInput
                name="type"
                defaultValue={String(record.type ?? "IMAGE")}
              >
                <option value="IMAGE">IMAGE</option>
                <option value="VIDEO">VIDEO</option>
                <option value="OTHER">OTHER</option>
              </SelectInput>
            </Field>
            <div className="sm:col-span-2">
              <Field label="URL">
                <TextInput
                  name="url"
                  required
                  defaultValue={String(record.url ?? "")}
                />
              </Field>
            </div>
            <Field label="Alt text">
              <TextInput name="alt" defaultValue={String(record.alt ?? "")} />
            </Field>
            <Field label="Caption">
              <TextInput
                name="caption"
                defaultValue={String(record.caption ?? "")}
              />
            </Field>
            <Field
              label="Media asset ID"
              hint="Upload via Admin → Media (purpose GALLERY)."
            >
              <TextInput
                name="mediaAssetId"
                defaultValue={String(record.mediaAssetId ?? "")}
              />
            </Field>
            <Field label="Content status">
              <StatusSelect
                defaultValue={String(record.contentStatus ?? "DRAFT")}
              />
            </Field>
            <Field label="Sort order">
              <TextInput
                name="sortOrder"
                type="number"
                defaultValue={String(record.sortOrder ?? 0)}
              />
            </Field>
            <Check
              name="historicallyImportant"
              label="Historically important"
              defaultChecked={Boolean(record.historicallyImportant)}
            />
            <Check
              name="isSample"
              label="Sample content"
              defaultChecked={Boolean(record.isSample)}
            />
          </>
        ),
      };
    default:
      return {
        action: async () => undefined,
        fields: <p className="text-sm text-ink-500">Unknown content type.</p>,
      };
  }
}

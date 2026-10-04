"use client";

import { Button } from "@/components/ui/button";
import { MEDIA_PURPOSES } from "@/lib/media/purposes";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function MediaUploadForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [lastId, setLastId] = useState<string | null>(null);
  const [lastPurpose, setLastPurpose] = useState<string | null>(null);

  return (
    <form
      className="space-y-4 rounded-lg border border-border-subtle bg-white p-5"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        setOk(null);
        setLastId(null);
        setLastPurpose(null);
        const form = event.currentTarget;
        const data = new FormData(form);
        const purpose = String(data.get("purpose") ?? "GALLERY");
        startTransition(async () => {
          try {
            const res = await fetch("/api/admin/media/upload", {
              method: "POST",
              body: data,
            });
            const json = (await res.json()) as { error?: string; id?: string };
            if (!res.ok) {
              setError(json.error ?? "Upload failed.");
              return;
            }
            setOk(`Uploaded ${json.id}`);
            setLastId(json.id ?? null);
            setLastPurpose(purpose);
            form.reset();
            router.refresh();
          } catch {
            setError("Upload failed.");
          }
        });
      }}
    >
      <h2 className="text-base font-medium text-ink-900">Upload image</h2>
      <p className="text-sm text-ink-500">
        JPEG, PNG, WebP, or GIF only. Executables, SVG, and scripts are rejected.
        Images are optimized into responsive variants and stored in object storage.
        After upload, attach the asset ID to gallery media, an event/puja cover,
        a committee portrait, or set hero slot key <code>home.hero</code> for the
        homepage.
      </p>
      <label className="block space-y-1.5 text-sm">
        <span className="font-medium text-ink-800">File</span>
        <input
          type="file"
          name="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          required
          className="block w-full text-sm"
        />
      </label>
      <label className="block space-y-1.5 text-sm">
        <span className="font-medium text-ink-800">Purpose</span>
        <select
          name="purpose"
          defaultValue="GALLERY"
          className="w-full rounded-md border border-border-subtle px-3 py-2"
        >
          {MEDIA_PURPOSES.map((purpose) => (
            <option key={purpose} value={purpose}>
              {purpose}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1.5 text-sm">
        <span className="font-medium text-ink-800">Alt text</span>
        <input
          name="alt"
          required
          minLength={3}
          maxLength={300}
          placeholder="Describe the image for accessibility"
          className="w-full rounded-md border border-border-subtle px-3 py-2"
        />
      </label>
      <label className="block space-y-1.5 text-sm">
        <span className="font-medium text-ink-800">Caption (optional)</span>
        <input
          name="caption"
          maxLength={500}
          className="w-full rounded-md border border-border-subtle px-3 py-2"
        />
      </label>
      <label className="block space-y-1.5 text-sm">
        <span className="font-medium text-ink-800">
          Hero slot key (optional, for HERO purpose)
        </span>
        <input
          name="slotKey"
          placeholder="home.hero"
          className="w-full rounded-md border border-border-subtle px-3 py-2"
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-ink-800">
        <input type="checkbox" name="historicallyImportant" value="true" />
        Historically important (blocks deletion)
      </label>
      {error ? (
        <p className="text-sm text-danger-700" role="alert">
          {error}
        </p>
      ) : null}
      {ok ? (
        <div className="space-y-2 text-sm text-ink-700" role="status">
          <p>{ok}</p>
          {lastId ? (
            <p className="rounded-md border border-border-subtle bg-surface-muted px-3 py-2 font-mono text-xs break-all">
              Public URL: /api/media/{lastId}?v=md
            </p>
          ) : null}
          {lastId && lastPurpose === "HERO" ? (
            <p>
              For the homepage hero, upload with purpose HERO and slot key{" "}
              <code>home.hero</code> (or re-upload / edit the asset slot).
            </p>
          ) : null}
          {lastId && lastPurpose === "GALLERY" ? (
            <p>
              Next: Admin → Content → Gallery media → add item, paste this asset
              ID, status PUBLISHED, into a published album.
            </p>
          ) : null}
          {lastId && lastPurpose === "COMMITTEE_PORTRAIT" ? (
            <p>
              Next: Admin → Content → Committee → set portrait asset ID on the
              published member.
            </p>
          ) : null}
          {lastId &&
          (lastPurpose === "EVENT" || lastPurpose === "PUJA") ? (
            <p>
              Next: set this asset as the cover asset ID on the published
              event or puja year.
            </p>
          ) : null}
        </div>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Uploading…" : "Upload"}
      </Button>
    </form>
  );
}

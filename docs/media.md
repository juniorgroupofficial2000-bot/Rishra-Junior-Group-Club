# Media management

Image binaries are stored in **object storage**, never in PostgreSQL. Postgres holds `MediaAsset` metadata (alt, caption, variants, checksum, purpose).

## Drivers

| `MEDIA_STORAGE_DRIVER` | Backend |
| --- | --- |
| `local` (default) | Files under `MEDIA_LOCAL_ROOT` (default `.data/media`), outside `public/` |
| `s3` | S3-compatible bucket (AWS S3, R2, MinIO) via `@aws-sdk/client-s3` |

Swap providers by changing env — callers use `getObjectStorage()`.

## Upload pipeline

1. Admin auth + purpose-scoped permission
2. Magic-byte MIME sniff (JPEG/PNG/WebP/GIF only)
3. Reject executables, SVG, HTML, scripts
4. Size limits (purpose-specific, max 8MB)
5. Safe filenames / non-traversing object keys
6. Sharp optimization → `thumb`, `sm`, `md`, `lg`, `original` (WebP)
7. Persist metadata + audit `media.uploaded`

## Delivery

`GET /api/media/:assetId?v=md` streams READY variants with `X-Content-Type-Options: nosniff`.

## Purposes

`COMMITTEE_PORTRAIT` · `GALLERY` · `EVENT` · `PUJA` · `HERO` · `GENERAL`

Historically important assets cannot be soft-deleted; hard delete is blocked by DB trigger.

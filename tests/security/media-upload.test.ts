import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createLocalObjectStorageForTests,
  resetObjectStorageForTests,
} from "@/server/media/storage";
import {
  assertSafeStorageKey,
  buildSafeStorageKey,
  detectForbiddenPayload,
  sanitizeOriginalFilename,
  sniffImageMime,
  validateUploadBuffer,
  MediaValidationError,
} from "@/server/media/validation";
import { optimizeImageVariants } from "@/server/media/optimize";

/** 1×1 PNG */
const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

describe("media upload security", () => {
  it("sniffs real image MIME types from magic bytes", () => {
    expect(sniffImageMime(PNG_1X1)).toBe("image/png");
  });

  it("rejects executables even when named like images", () => {
    const mz = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]);
    expect(detectForbiddenPayload(mz)).toMatch(/Executable/i);
    expect(() =>
      validateUploadBuffer({
        buffer: mz,
        filename: "photo.png",
        declaredMime: "image/png",
        purpose: "GALLERY",
      }),
    ).toThrow(MediaValidationError);
  });

  it("rejects SVG / HTML / PHP script uploads through image pipeline", () => {
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
    expect(detectForbiddenPayload(svg)).toMatch(/SVG/i);

    const html = Buffer.from("<!DOCTYPE html><html><script>alert(1)</script>");
    expect(detectForbiddenPayload(html)).toMatch(/HTML|script/i);

    const php = Buffer.from("<?php system($_GET['x']);");
    expect(detectForbiddenPayload(php)).toMatch(/Script/i);
  });

  it("rejects MIME mismatch (declared jpeg, actual png)", () => {
    expect(() =>
      validateUploadBuffer({
        buffer: PNG_1X1,
        filename: "x.jpg",
        declaredMime: "image/jpeg",
        purpose: "GALLERY",
      }),
    ).toThrow(/Content-Type does not match/i);
  });

  it("rejects oversized payloads for purpose limits", () => {
    const huge = Buffer.alloc(5 * 1024 * 1024);
    // Pretend JPEG magic so we fail on size, not sniff.
    huge[0] = 0xff;
    huge[1] = 0xd8;
    huge[2] = 0xff;
    expect(() =>
      validateUploadBuffer({
        buffer: huge,
        filename: "big.jpg",
        declaredMime: "image/jpeg",
        purpose: "COMMITTEE_PORTRAIT",
      }),
    ).toThrow(/4MB/i);
  });

  it("sanitizes filenames and blocks path traversal in storage keys", () => {
    expect(sanitizeOriginalFilename("../../etc/passwd.exe")).toBe(
      "passwd.exe",
    );
    expect(sanitizeOriginalFilename("My Photo (1).PNG")).toMatch(/Photo/);

    expect(() => assertSafeStorageKey("../secret")).toThrow(/Invalid storage key/);
    expect(() => assertSafeStorageKey("/abs/path")).toThrow(/Invalid storage key/);
    expect(() => assertSafeStorageKey("a\\b")).toThrow(/Invalid storage key/);

    const key = buildSafeStorageKey({
      purpose: "GALLERY",
      assetId: "cabc123def456",
      variant: "thumb",
      mimeType: "image/webp",
      originalFilename: "../../evil.png",
    });
    expect(key.includes("..")).toBe(false);
    expect(key.startsWith("gallery/")).toBe(true);
    expect(key).toContain("thumb-");
  });

  it("rejects dangerous extensions even with image bytes", () => {
    expect(() =>
      validateUploadBuffer({
        buffer: PNG_1X1,
        filename: "payload.php.png",
        declaredMime: "image/png",
        purpose: "GALLERY",
      }),
    ).not.toThrow();

    expect(() =>
      validateUploadBuffer({
        buffer: PNG_1X1,
        filename: "payload.php",
        declaredMime: "image/png",
        purpose: "GALLERY",
      }),
    ).toThrow(/extensions are not allowed/i);
  });
});

describe("media optimization + local object storage", () => {
  let root: string;

  beforeEach(() => {
    root = mkdtempSync(path.join(tmpdir(), "rjgc-media-"));
    process.env.MEDIA_STORAGE_DRIVER = "local";
    process.env.MEDIA_LOCAL_ROOT = root;
    resetObjectStorageForTests();
  });

  afterEach(() => {
    resetObjectStorageForTests();
    rmSync(root, { recursive: true, force: true });
  });

  it("produces thumbnail and responsive webp variants", async () => {
    const result = await optimizeImageVariants(PNG_1X1, "image/png");
    const names = result.variants.map((v) => v.name).sort();
    expect(names).toEqual(["lg", "md", "original", "sm", "thumb"].sort());
    expect(result.variants.every((v) => v.buffer.length > 0)).toBe(true);
    expect(result.variants.find((v) => v.name === "thumb")?.mimeType).toBe(
      "image/webp",
    );
  });

  it("local storage rejects path traversal on put/get", async () => {
    const storage = createLocalObjectStorageForTests(root);
    await expect(
      storage.putObject({
        key: "../escape.webp",
        body: PNG_1X1,
        contentType: "image/png",
      }),
    ).rejects.toThrow();
  });
});

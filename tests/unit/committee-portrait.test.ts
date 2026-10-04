import { describe, expect, it } from "vitest";
import { resolveCommitteePortrait } from "@/content/site-media";

describe("resolveCommitteePortrait", () => {
  it("maps DB-style members to seed portrait files by role and name", () => {
    const portrait = resolveCommitteePortrait({
      id: "cuid_not_a_seed_id",
      roleKey: "president",
      name: "Satrudhan Burman",
      displayName: "Satrudhan Burman (Monu)",
    });
    expect(portrait.src).toBe("/images/committee/monu.png");
  });

  it("prefers linked managed media URLs", () => {
    const portrait = resolveCommitteePortrait({
      id: "cuid_not_a_seed_id",
      roleKey: "president",
      name: "Satrudhan Burman",
      portraitSrc: "/api/media/abc123?v=sm",
      portraitAlt: "Custom alt",
    });
    expect(portrait.src).toBe("/api/media/abc123?v=sm");
    expect(portrait.alt).toBe("Custom alt");
  });

  it("resolves treasurer portrait by name", () => {
    const portrait = resolveCommitteePortrait({
      id: "another_cuid",
      roleKey: "treasurer",
      name: "Aalok Barma",
      displayName: "Aalok Barma",
    });
    expect(portrait.src).toBe("/images/committee/Aalok.png");
  });
});

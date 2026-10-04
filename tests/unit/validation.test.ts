import { describe, expect, it } from "vitest";
import { loginSchema } from "@/server/auth/config";
import {
  announcementContentSchema,
  contentStatusSchema,
  eventContentSchema,
  faqItemSchema,
  galleryAlbumSchema,
} from "@/server/content/validation";
import {
  createMemberSchema,
  memberStatusUpdateSchema,
  updateMemberSchema,
} from "@/server/validation/member";

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const parsed = loginSchema.safeParse({
      email: "Member@RJGC.local",
      password: "MemberDemo1!",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.email).toBe("member@rjgc.local");
    }
  });

  it("rejects short passwords and invalid emails", () => {
    expect(
      loginSchema.safeParse({ email: "not-an-email", password: "MemberDemo1!" })
        .success,
    ).toBe(false);
    expect(
      loginSchema.safeParse({ email: "a@b.co", password: "short" }).success,
    ).toBe(false);
  });

  it("accepts FormData-shaped payloads where totp is null", () => {
    const parsed = loginSchema.safeParse({
      email: "member@rjgc.local",
      password: "MemberDemo1!",
      totp: null,
    });
    expect(parsed.success).toBe(true);
  });
});

describe("member validation", () => {
  const validCreate = {
    membershipNumber: "RJGC-100",
    firstName: "Test",
    lastName: "Member",
    displayName: "Test Member",
    email: "test.member@rjgc.local",
    status: "PENDING" as const,
    country: "IN",
  };

  it("accepts a valid create payload and defaults country when omitted", () => {
    const { country: _country, ...withoutCountry } = validCreate;
    const parsed = createMemberSchema.safeParse(withoutCountry);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.country).toBe("IN");
      expect(parsed.data.status).toBe("PENDING");
    }
  });

  it("rejects invalid membership numbers and empty names", () => {
    expect(
      createMemberSchema.safeParse({
        ...validCreate,
        membershipNumber: "bad value!",
      }).success,
    ).toBe(false);
    expect(
      createMemberSchema.safeParse({ ...validCreate, firstName: "" }).success,
    ).toBe(false);
  });

  it("allows partial updates and ignores immutable membership numbers", () => {
    expect(updateMemberSchema.safeParse({ firstName: "Ada" }).success).toBe(
      true,
    );
    // membershipNumber is immutable — unknown/extra keys are stripped.
    const parsed = updateMemberSchema.safeParse({
      firstName: "Ada",
      membershipNumber: "!!",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).not.toHaveProperty("membershipNumber");
    }
  });

  it("validates status transitions payload", () => {
    expect(
      memberStatusUpdateSchema.safeParse({ status: "SUSPENDED" }).success,
    ).toBe(true);
    expect(
      memberStatusUpdateSchema.safeParse({ status: "BOGUS" }).success,
    ).toBe(false);
    expect(
      memberStatusUpdateSchema.safeParse({
        status: "ACTIVE",
        reason: "ok",
      }).success,
    ).toBe(false); // reason min 3 when present — "ok" is 2 chars
    expect(
      memberStatusUpdateSchema.safeParse({
        status: "ACTIVE",
        reason: "Approved after review",
      }).success,
    ).toBe(true);
  });
});

describe("content validation", () => {
  it("accepts published FAQ and rejects tiny answers", () => {
    expect(
      faqItemSchema.safeParse({
        question: "When is puja?",
        answer: "Every year in Magha.",
        status: "PUBLISHED",
      }).success,
    ).toBe(true);
    expect(
      faqItemSchema.safeParse({
        question: "Hi",
        answer: "No",
      }).success,
    ).toBe(false);
  });

  it("enforces kebab-case event slugs", () => {
    expect(
      eventContentSchema.safeParse({
        slug: "Bad Slug",
        title: "Event",
        description: "Desc",
        startsAt: new Date().toISOString(),
        contentStatus: "DRAFT",
      }).success,
    ).toBe(false);
    expect(
      eventContentSchema.safeParse({
        slug: "saraswati-puja-2026",
        title: "Saraswati Puja",
        description: "Club celebration",
        startsAt: new Date().toISOString(),
        contentStatus: "PUBLISHED",
      }).success,
    ).toBe(true);
  });

  it("rejects invalid gallery album slugs and unknown statuses", () => {
    expect(contentStatusSchema.safeParse("LIVE").success).toBe(false);
    expect(
      galleryAlbumSchema.safeParse({
        slug: "Album!",
        title: "Album",
        contentStatus: "DRAFT",
      }).success,
    ).toBe(false);
  });

  it("validates announcement content", () => {
    expect(
      announcementContentSchema.safeParse({
        slug: "dues-reminder",
        title: "Dues reminder",
        body: "Please clear dues.",
        status: "PUBLISHED",
      }).success,
    ).toBe(true);
  });
});

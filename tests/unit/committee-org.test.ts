import { describe, expect, it } from "vitest";
import { slugifyCommitteeName } from "@/lib/committees/slug";
import {
  designationLabel,
  executiveHierarchyRank,
  isCommitteeDesignation,
} from "@/server/domain/committee-designations";

describe("committee organization helpers", () => {
  it("slugifies committee names", () => {
    expect(slugifyCommitteeName("Animal & Welfare Committee")).toBe(
      "animal-and-welfare-committee",
    );
    expect(slugifyCommitteeName("Sports & Youth")).toBe("sports-and-youth");
  });

  it("resolves designation labels", () => {
    expect(isCommitteeDesignation("chairperson")).toBe(true);
    expect(designationLabel("chairperson")).toBe("Chairperson");
    expect(designationLabel("member", "Lead Volunteer")).toBe("Lead Volunteer");
  });

  it("ranks executive hierarchy", () => {
    expect(executiveHierarchyRank("president")).toBeLessThan(
      executiveHierarchyRank("secretary"),
    );
    expect(executiveHierarchyRank("secretary")).toBeLessThan(
      executiveHierarchyRank("executive_member"),
    );
  });
});

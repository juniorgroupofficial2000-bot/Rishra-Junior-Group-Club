import { describe, expect, it } from "vitest";
import {
  adminQueryString,
  parseOptionalDate,
  parsePage,
  parsePageSize,
} from "@/lib/admin/list-params";

describe("admin list params", () => {
  it("parses safe page and pageSize bounds", () => {
    expect(parsePage("0")).toBe(1);
    expect(parsePage("3")).toBe(3);
    expect(parsePageSize("500", 20, 100)).toBe(100);
    expect(parsePageSize(undefined)).toBe(20);
  });

  it("builds query strings without empty values", () => {
    expect(
      adminQueryString(
        { query: "ada", status: "", page: "1" },
        { page: "2" },
      ),
    ).toBe("query=ada&page=2");
  });

  it("parses optional dates", () => {
    expect(parseOptionalDate("2026-01-02")?.toISOString().startsWith("2026-01-02")).toBe(
      true,
    );
    expect(parseOptionalDate("not-a-date")).toBeUndefined();
  });
});

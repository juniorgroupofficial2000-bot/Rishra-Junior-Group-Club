import { describe, expect, it } from "vitest";
import { toCsvLine } from "@/server/csv/parse-csv";
import { neutralizeCsvFormula } from "@/server/security/csv-safe";

describe("CSV formula neutralization", () => {
  it("prefixes dangerous formula starters", () => {
    expect(neutralizeCsvFormula("=CMD()")).toBe("'=CMD()");
    expect(neutralizeCsvFormula("+1+1")).toBe("'+1+1");
    expect(neutralizeCsvFormula("-1+1")).toBe("'-1+1");
    expect(neutralizeCsvFormula("@SUM(A1)")).toBe("'@SUM(A1)");
  });

  it("applies neutralization in CSV line encoding", () => {
    const line = toCsvLine(["ok", "=HYPERLINK(\"http://evil\")", "normal"]);
    expect(line).toContain("'=HYPERLINK");
    expect(line.startsWith("=")).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { formatAmountLabel } from "@/server/repositories/prisma/mappers";

describe("payment amount calculations / labels", () => {
  it("formats INR paise as rupees with two decimals", () => {
    expect(formatAmountLabel(0)).toBe("₹0.00");
    expect(formatAmountLabel(100)).toBe("₹1.00");
    expect(formatAmountLabel(10000)).toBe("₹100.00");
    expect(formatAmountLabel(10050)).toBe("₹100.50");
    expect(formatAmountLabel(1)).toBe("₹0.01");
  });

  it("formats non-INR currencies with ISO code prefix", () => {
    expect(formatAmountLabel(2500, "USD")).toBe("USD 25.00");
  });

  it("keeps plan-authoritative amounts as integers in paise space", () => {
    // Guard: UI labels must not introduce float drift for ledger units.
    const planPaise = 50000;
    const label = formatAmountLabel(planPaise);
    expect(label).toBe("₹500.00");
    const backToMajor = Number(label.replace("₹", ""));
    expect(Math.round(backToMajor * 100)).toBe(planPaise);
  });
});

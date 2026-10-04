/**
 * Neutralize spreadsheet formula injection for CSV export cells.
 * Excel/Sheets may execute cells starting with = + - @ \t \r.
 */
export function neutralizeCsvFormula(value: string): string {
  if (!value) return value;
  const first = value[0];
  if (
    first === "=" ||
    first === "+" ||
    first === "-" ||
    first === "@" ||
    first === "\t" ||
    first === "\r"
  ) {
    return `'${value}`;
  }
  return value;
}

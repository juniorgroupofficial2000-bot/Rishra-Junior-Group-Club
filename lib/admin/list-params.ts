export type AdminListQuery = Record<string, string | undefined>;

export function parsePage(value: string | undefined, fallback = 1): number {
  const n = Number(value ?? fallback);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

export function parsePageSize(
  value: string | undefined,
  fallback = 20,
  max = 100,
): number {
  const n = Number(value ?? fallback);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(max, Math.floor(n));
}

/** Build a query string preserving filters while setting page. */
export function adminQueryString(
  params: AdminListQuery,
  overrides: AdminListQuery = {},
): string {
  const merged = { ...params, ...overrides };
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value == null || value === "") continue;
    search.set(key, value);
  }
  return search.toString();
}

export function parseOptionalDate(value: string | undefined): Date | undefined {
  if (!value?.trim()) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

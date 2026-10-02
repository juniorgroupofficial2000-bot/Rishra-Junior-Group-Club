type JsonLdValue =
  | Record<string, unknown>
  | Array<Record<string, unknown> | null | undefined>
  | null
  | undefined;

type JsonLdProps = {
  data: JsonLdValue;
};

/** Server-safe JSON-LD script tag for valid structured data. */
export function JsonLd({ data }: JsonLdProps) {
  const normalized = Array.isArray(data)
    ? data.filter((item): item is Record<string, unknown> => Boolean(item))
    : data;
  if (!normalized || (Array.isArray(normalized) && normalized.length === 0)) {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(normalized) }}
    />
  );
}

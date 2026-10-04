import { SiteContainer } from "@/components/public";

export default function PublicLoading() {
  return (
    <div
      className="flex flex-1 flex-col"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <SiteContainer className="py-10 sm:py-14">
        <div className="h-3 w-28 animate-pulse rounded bg-ink-100" />
        <div className="mt-6 h-10 max-w-md animate-pulse rounded-md bg-ink-100" />
        <div className="mt-3 h-5 max-w-xs animate-pulse rounded bg-ink-100" />
        <div className="mt-8 space-y-3">
          <div className="h-4 max-w-2xl animate-pulse rounded bg-ink-100" />
          <div className="h-4 max-w-xl animate-pulse rounded bg-ink-100" />
          <div className="h-4 max-w-lg animate-pulse rounded bg-ink-100" />
        </div>
        <span className="sr-only">Loading page</span>
      </SiteContainer>
    </div>
  );
}

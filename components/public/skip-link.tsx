export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[var(--z-toast)] focus:rounded-md focus:bg-ink-900 focus:px-4 focus:py-3 focus:text-sm focus:font-medium focus:text-white focus:shadow-md"
    >
      Skip to main content
    </a>
  );
}

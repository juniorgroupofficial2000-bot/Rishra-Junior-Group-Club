import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col bg-heritage-grain">
      <div className="container-page flex flex-1 flex-col justify-center py-16 sm:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-alta-600">
          Established 2000
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
          Rishra Junior Group Club
        </h1>
        <p className="mt-2 font-bengali text-xl text-ink-600 sm:text-2xl">
          রিশরা জুনিয়র গ্রুপ ক্লাব
        </p>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-500">
          786, Morepukur, Natun Gram, Rishra, Hooghly, West Bengal 712250, India.
          Public site and member platform are in progress.
        </p>
        <div className="mt-8">
          <Link
            href="/design-system"
            className="inline-flex h-11 items-center justify-center rounded-md bg-ink-900 px-4 text-sm font-medium text-white shadow-xs transition-colors hover:bg-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            View design system
          </Link>
        </div>
      </div>
    </main>
  );
}

import { TableSkeleton } from "@/components/ui/skeleton";

export default function PaymentsLoading() {
  return (
    <div className="space-y-4 p-4 sm:p-6 lg:p-8">
      <div className="h-8 w-40 animate-pulse rounded-md bg-ink-100" />
      <div className="h-12 w-full animate-pulse rounded-md bg-ink-50" />
      <TableSkeleton rows={8} cols={6} />
    </div>
  );
}

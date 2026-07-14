import { Card } from "@/components/ui/card";

export default function ReportsLoading() {
  return (
    <>
      <div className="mb-6 flex flex-col gap-3 border-b border-border pb-5">
        <div className="h-3 w-20 animate-pulse rounded bg-surface-muted" />
        <div className="h-7 w-48 animate-pulse rounded bg-surface-muted" />
        <div className="h-4 w-full max-w-2xl animate-pulse rounded bg-surface-muted" />
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="p-5">
            <div className="mb-5 h-9 w-9 animate-pulse rounded-md bg-surface-muted" />
            <div className="h-3 w-24 animate-pulse rounded bg-surface-muted" />
            <div className="mt-3 h-7 w-32 animate-pulse rounded bg-surface-muted" />
            <div className="mt-2 h-3 w-28 animate-pulse rounded bg-surface-muted" />
          </Card>
        ))}
      </section>
      <div className="mt-6 h-24 animate-pulse rounded-lg bg-surface-muted" />
    </>
  );
}

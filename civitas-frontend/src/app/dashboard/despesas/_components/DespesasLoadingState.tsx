export default function DespesasLoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={`summary-skeleton-${index}`}
            className="h-[180px] animate-pulse rounded-sm bg-[var(--surface-subtle)]"
          />
        ))}
      </div>

      <div className="h-[240px] animate-pulse rounded-sm bg-[var(--surface-subtle)]" />
      <div className="h-[360px] animate-pulse rounded-sm bg-[var(--surface-subtle)]" />
    </div>
  );
}

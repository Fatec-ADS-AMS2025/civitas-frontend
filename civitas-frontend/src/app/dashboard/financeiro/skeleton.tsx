export default function FinanceiroSkeleton() {
  return (
    <div className="skeleton-loader space-y-6">
      <div className="relative overflow-hidden rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-6 shadow-[var(--shadow-sm)]">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="skeleton-line h-6 w-32 rounded-sm" />
            <div className="skeleton-line mt-4 h-10 w-3/4 rounded-sm" />
            <div className="skeleton-line mt-3 h-5 w-1/2 rounded-sm" />
            <div className="mt-4 flex gap-2">
              <div className="skeleton-line h-7 w-44 rounded-sm" />
              <div className="skeleton-line h-7 w-40 rounded-sm" />
            </div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="civitas-card-soft flex items-center justify-between p-3">
                <div className="skeleton-line h-4 w-32 rounded-sm" />
                <div className="skeleton-line h-6 w-16 rounded-sm" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-5 shadow-[var(--shadow-sm)]"
          >
            <div className="skeleton-line h-3 w-24 rounded-sm" />
            <div className="skeleton-line mt-3 h-8 w-32 rounded-sm" />
            <div className="skeleton-line mt-2 h-3 w-40 rounded-sm" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-5 shadow-[var(--shadow-sm)]">
          <div className="skeleton-line h-5 w-20 rounded-sm" />
          <div className="mt-4 space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="skeleton-line h-11 w-full rounded-sm" />
            ))}
          </div>
        </div>
        <div className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-5 shadow-[var(--shadow-sm)]">
          <div className="skeleton-line h-5 w-20 rounded-sm" />
          <div className="mt-4 space-y-3">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="skeleton-line h-11 w-full rounded-sm" />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-5 shadow-[var(--shadow-sm)]">
        <div className="skeleton-line h-5 w-40 rounded-sm" />
        <div className="mt-4 space-y-3">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="civitas-card-soft flex items-center gap-4 p-4">
              <div className="skeleton-line h-4 w-12 rounded-sm" />
              <div className="skeleton-line h-4 w-20 rounded-sm" />
              <div className="skeleton-line h-4 w-40 flex-1 rounded-sm" />
              <div className="skeleton-line h-4 w-24 rounded-sm" />
              <div className="skeleton-line h-4 w-24 rounded-sm" />
              <div className="skeleton-line h-6 w-16 rounded-sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

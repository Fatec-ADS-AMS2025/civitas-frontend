function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`skeleton-line rounded-sm ${className}`.trim()} />;
}

function Surface({
  children,
  className = "",
}: Readonly<{
  children: React.ReactNode;
  className?: string;
}>) {
  return (
    <div
      className={`skeleton-loader rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-5 shadow-[var(--shadow-sm)] ${className}`.trim()}
    >
      {children}
    </div>
  );
}

export default function DashboardSkeleton() {
  return (
    <div className="skeleton-loader space-y-6">
      <div className="rounded-sm bg-[var(--tone-teal-bg)] px-6 py-7 shadow-[var(--shadow-md)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="w-full max-w-3xl space-y-4">
            <SkeletonBlock className="h-7 w-40 rounded-sm" />
            <SkeletonBlock className="h-10 w-full max-w-[640px]" />
            <SkeletonBlock className="h-10 w-full max-w-[520px]" />
            <SkeletonBlock className="h-4 w-full max-w-[460px]" />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <SkeletonBlock className="h-12 w-40 rounded-sm" />
            <SkeletonBlock className="h-12 w-40 rounded-sm" />
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`dashboard-metric-${index}`}
            className="skeleton-loader rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-5 shadow-[var(--shadow-sm)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <SkeletonBlock className="h-4 w-24" />
                <SkeletonBlock className="h-8 w-32" />
                <SkeletonBlock className="h-4 w-36" />
              </div>
              <SkeletonBlock className="h-14 w-14 rounded-sm" />
            </div>
            <SkeletonBlock className="mt-6 h-12 rounded-sm" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Surface>
          <SkeletonBlock className="h-6 w-28 rounded-sm" />
          <SkeletonBlock className="mt-4 h-8 w-72" />
          <SkeletonBlock className="mt-3 h-4 w-80 max-w-full" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`action-card-${index}`} className="civitas-card-soft px-4 py-4">
                <div className="flex items-center gap-4">
                  <SkeletonBlock className="h-11 w-11 rounded-sm" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <SkeletonBlock className="h-5 w-44" />
                    <SkeletonBlock className="h-4 w-full max-w-[280px]" />
                  </div>
                  <SkeletonBlock className="h-10 w-28 rounded-sm" />
                </div>
              </div>
            ))}
          </div>
        </Surface>

        <Surface>
          <SkeletonBlock className="h-6 w-24 rounded-sm" />
          <SkeletonBlock className="mt-4 h-8 w-64" />
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`overview-card-${index}`} className="civitas-card-soft px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <SkeletonBlock className="h-4 w-28" />
                  <SkeletonBlock className="h-5 w-5 rounded-sm" />
                </div>
                <SkeletonBlock className="mt-4 h-9 w-20" />
              </div>
            ))}
          </div>
        </Surface>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Surface key={`ranking-${index}`}>
            <SkeletonBlock className="h-8 w-64" />
            <SkeletonBlock className="mt-3 h-4 w-72 max-w-full" />
            <div className="mt-6 space-y-4">
              {Array.from({ length: 5 }).map((__, rowIndex) => (
                <div key={`ranking-row-${index}-${rowIndex}`}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="space-y-2">
                      <SkeletonBlock className="h-5 w-40" />
                      <SkeletonBlock className="h-4 w-24" />
                    </div>
                    <SkeletonBlock className="h-5 w-20" />
                  </div>
                  <SkeletonBlock className="h-3 rounded-sm" />
                </div>
              ))}
            </div>
          </Surface>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Surface>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <SkeletonBlock className="h-6 w-32 rounded-sm" />
              <SkeletonBlock className="h-8 w-60" />
              <SkeletonBlock className="h-4 w-80 max-w-full" />
            </div>
            <SkeletonBlock className="h-12 w-full max-w-md rounded-sm" />
          </div>

          <div className="mt-6 grid gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={`recent-expense-${index}`} className="civitas-card-soft px-4 py-4">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                  <div className="space-y-2">
                    <SkeletonBlock className="h-6 w-28" />
                    <SkeletonBlock className="h-4 w-full max-w-[280px]" />
                    <SkeletonBlock className="h-4 w-40" />
                  </div>
                  <div className="space-y-2">
                    <SkeletonBlock className="h-4 w-20" />
                    <SkeletonBlock className="h-4 w-16" />
                  </div>
                  <div className="hidden self-center sm:block">
                    <SkeletonBlock className="h-9 w-28 rounded-sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Surface>

        <Surface>
          <SkeletonBlock className="h-6 w-28 rounded-sm" />
          <SkeletonBlock className="mt-4 h-8 w-56" />
          <SkeletonBlock className="mt-3 h-4 w-full max-w-[300px]" />

          <div className="mt-6 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={`priority-card-${index}`} className="civitas-card-soft px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <SkeletonBlock className="h-5 w-40" />
                    <SkeletonBlock className="h-4 w-20" />
                  </div>
                  <SkeletonBlock className="h-8 w-28 rounded-sm" />
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <SkeletonBlock className="h-4 w-32" />
                  <SkeletonBlock className="h-5 w-24" />
                </div>
              </div>
            ))}
          </div>
        </Surface>
      </div>
    </div>
  );
}

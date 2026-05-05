import type { ReactNode } from "react";

type SkeletonBlockProps = {
  className?: string;
};

function SkeletonBlock({ className = "" }: SkeletonBlockProps) {
  return <div className={`skeleton-line rounded-sm ${className}`.trim()} />;
}

function Surface({
  children,
  className = "",
}: Readonly<{
  children: ReactNode;
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

type CrudRouteSkeletonProps = {
  columns?: number;
  filters?: number;
  rows?: number;
};

export default function CrudRouteSkeleton({
  columns = 5,
  filters = 4,
  rows = 6,
}: CrudRouteSkeletonProps) {
  const tableColumns = `repeat(${columns}, minmax(0, 1fr)) minmax(96px, 120px)`;

  return (
    <div className="space-y-5">
      <Surface className="space-y-5">
        <div className="space-y-2">
          <SkeletonBlock className="h-5 w-20" />
          <SkeletonBlock className="h-4 w-56" />
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <SkeletonBlock className="h-12 flex-1 rounded-sm" />
          <SkeletonBlock className="h-12 w-full rounded-sm md:w-36" />
          <SkeletonBlock className="h-12 w-full rounded-sm md:w-32" />
        </div>

        <div className="flex flex-wrap gap-3 border-t border-[var(--border-soft)] pt-4">
          {Array.from({ length: filters }).map((_, index) => (
            <SkeletonBlock
              key={`crud-filter-${index}`}
              className="h-11 min-w-[160px] flex-1 rounded-sm"
            />
          ))}
          <SkeletonBlock className="h-11 w-full rounded-sm sm:w-32" />
        </div>
      </Surface>

      <Surface className="overflow-hidden p-0">
        <div className="border-b border-[var(--border-soft)] px-5 py-5">
          <SkeletonBlock className="h-7 w-52" />
          <SkeletonBlock className="mt-3 h-4 w-80 max-w-full" />
        </div>

        <div className="space-y-3 px-4 py-5 sm:px-5 lg:px-6">
          <div
            className="hidden gap-3 md:grid"
            style={{ gridTemplateColumns: tableColumns }}
          >
            {Array.from({ length: columns + 1 }).map((_, index) => (
              <SkeletonBlock key={`crud-head-${index}`} className="h-4 rounded-sm" />
            ))}
          </div>

          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div
              key={`crud-row-${rowIndex}`}
              className="grid gap-3 rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] px-4 py-4"
              style={{ gridTemplateColumns: tableColumns }}
            >
              {Array.from({ length: columns }).map((__, columnIndex) => (
                <SkeletonBlock
                  key={`crud-cell-${rowIndex}-${columnIndex}`}
                  className="h-5 rounded-sm"
                />
              ))}

              <div className="flex items-center justify-end gap-2">
                <SkeletonBlock className="h-10 w-10 rounded-sm" />
                <SkeletonBlock className="h-10 w-10 rounded-sm" />
                <SkeletonBlock className="h-10 w-10 rounded-sm" />
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-[var(--border-soft)] bg-[var(--surface-subtle)] px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SkeletonBlock className="h-4 w-48" />
            <div className="flex items-center gap-2">
              <SkeletonBlock className="h-9 w-28 rounded-sm" />
              <SkeletonBlock className="h-9 w-28 rounded-sm" />
              <SkeletonBlock className="h-9 w-32 rounded-sm" />
            </div>
          </div>
        </div>
      </Surface>
    </div>
  );
}

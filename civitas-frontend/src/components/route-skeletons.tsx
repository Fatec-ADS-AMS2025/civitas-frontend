import type { ReactNode } from "react";

type SkeletonBlockProps = {
  className?: string;
};

function SkeletonBlock({ className = "" }: SkeletonBlockProps) {
  return <div className={`skeleton-line rounded-[18px] ${className}`.trim()} />;
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
      className={`skeleton-loader rounded-[28px] border border-[#E4EEF0] bg-white p-5 shadow-[0_12px_28px_rgba(0,0,0,0.05)] ${className}`.trim()}
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

export function CrudRouteSkeleton({
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
          <SkeletonBlock className="h-12 flex-1 rounded-[20px]" />
          <SkeletonBlock className="h-12 w-full rounded-[20px] md:w-36" />
          <SkeletonBlock className="h-12 w-full rounded-[20px] md:w-32" />
        </div>

        <div className="flex flex-wrap gap-3 border-t border-[#E6EFF1] pt-4">
          {Array.from({ length: filters }).map((_, index) => (
            <SkeletonBlock
              key={`crud-filter-${index}`}
              className="h-11 min-w-[160px] flex-1 rounded-[18px]"
            />
          ))}
          <SkeletonBlock className="h-11 w-full rounded-[18px] sm:w-32" />
        </div>
      </Surface>

      <Surface className="overflow-hidden p-0">
        <div className="border-b border-[#E6EFF1] px-5 py-5">
          <SkeletonBlock className="h-7 w-52" />
          <SkeletonBlock className="mt-3 h-4 w-80 max-w-full" />
        </div>

        <div className="space-y-3 px-4 py-5 sm:px-5 lg:px-6">
          <div
            className="hidden gap-3 md:grid"
            style={{ gridTemplateColumns: tableColumns }}
          >
            {Array.from({ length: columns + 1 }).map((_, index) => (
              <SkeletonBlock key={`crud-head-${index}`} className="h-4 rounded-full" />
            ))}
          </div>

          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div
              key={`crud-row-${rowIndex}`}
              className="grid gap-3 rounded-[22px] border border-[#E6EFF1] bg-[#FCFEFE] px-4 py-4"
              style={{ gridTemplateColumns: tableColumns }}
            >
              {Array.from({ length: columns }).map((__, columnIndex) => (
                <SkeletonBlock
                  key={`crud-cell-${rowIndex}-${columnIndex}`}
                  className="h-5 rounded-full"
                />
              ))}

              <div className="flex items-center justify-end gap-2">
                <SkeletonBlock className="h-10 w-10 rounded-[12px]" />
                <SkeletonBlock className="h-10 w-10 rounded-[12px]" />
                <SkeletonBlock className="h-10 w-10 rounded-[12px]" />
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-[#E6EFF1] bg-[#FBFDFD] px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SkeletonBlock className="h-4 w-48" />
            <div className="flex items-center gap-2">
              <SkeletonBlock className="h-9 w-28 rounded-[14px]" />
              <SkeletonBlock className="h-9 w-28 rounded-[14px]" />
              <SkeletonBlock className="h-9 w-32 rounded-[14px]" />
            </div>
          </div>
        </div>
      </Surface>
    </div>
  );
}

export function DashboardRouteSkeleton() {
  return (
    <div className="skeleton-loader space-y-6">
      <div className="rounded-[30px] bg-[#EAF4F5] px-6 py-7 shadow-[0_18px_32px_rgba(11,100,112,0.10)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="w-full max-w-3xl space-y-4">
            <SkeletonBlock className="h-7 w-40 rounded-full" />
            <SkeletonBlock className="h-10 w-full max-w-[640px]" />
            <SkeletonBlock className="h-10 w-full max-w-[520px]" />
            <SkeletonBlock className="h-4 w-full max-w-[460px]" />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <SkeletonBlock className="h-12 w-40 rounded-full" />
            <SkeletonBlock className="h-12 w-40 rounded-full" />
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`dashboard-metric-${index}`}
            className="skeleton-loader rounded-[24px] border border-[#DCEAEC] bg-white p-5 shadow-[0_14px_35px_rgba(0,0,0,0.08)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <SkeletonBlock className="h-4 w-24" />
                <SkeletonBlock className="h-8 w-32" />
                <SkeletonBlock className="h-4 w-36" />
              </div>
              <SkeletonBlock className="h-14 w-14 rounded-[18px]" />
            </div>
            <SkeletonBlock className="mt-6 h-12 rounded-[18px]" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Surface>
          <SkeletonBlock className="h-6 w-28 rounded-full" />
          <SkeletonBlock className="mt-4 h-8 w-72" />
          <SkeletonBlock className="mt-3 h-4 w-80 max-w-full" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`action-card-${index}`}
                className="rounded-[20px] border border-[#E7EFF1] bg-[#FBFEFE] px-4 py-4"
              >
                <div className="flex items-center gap-4">
                  <SkeletonBlock className="h-11 w-11 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <SkeletonBlock className="h-5 w-44" />
                    <SkeletonBlock className="h-4 w-full max-w-[280px]" />
                  </div>
                  <SkeletonBlock className="h-10 w-28 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </Surface>

        <Surface>
          <SkeletonBlock className="h-6 w-24 rounded-full" />
          <SkeletonBlock className="mt-4 h-8 w-64" />
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`overview-card-${index}`}
                className="rounded-[20px] border border-[#E7EFF1] bg-[#FBFEFE] px-4 py-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <SkeletonBlock className="h-4 w-28" />
                  <SkeletonBlock className="h-5 w-5 rounded-full" />
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
                  <SkeletonBlock className="h-3 rounded-full" />
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
              <SkeletonBlock className="h-6 w-32 rounded-full" />
              <SkeletonBlock className="h-8 w-60" />
              <SkeletonBlock className="h-4 w-80 max-w-full" />
            </div>
            <SkeletonBlock className="h-12 w-full max-w-md rounded-[18px]" />
          </div>

          <div className="mt-6 grid gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={`recent-expense-${index}`}
                className="rounded-[18px] border border-[#E7EFF1] bg-[#FCFEFE] px-4 py-4"
              >
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
                    <SkeletonBlock className="h-9 w-28 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Surface>

        <Surface>
          <SkeletonBlock className="h-6 w-28 rounded-full" />
          <SkeletonBlock className="mt-4 h-8 w-56" />
          <SkeletonBlock className="mt-3 h-4 w-full max-w-[300px]" />

          <div className="mt-6 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={`priority-card-${index}`}
                className="rounded-[18px] border border-[#E7EFF1] bg-[#FCFEFE] px-4 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <SkeletonBlock className="h-5 w-40" />
                    <SkeletonBlock className="h-4 w-20" />
                  </div>
                  <SkeletonBlock className="h-8 w-28 rounded-full" />
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

export function FornecedorRouteSkeleton() {
  return <CrudRouteSkeleton columns={5} filters={5} rows={6} />;
}

export function UsuariosRouteSkeleton() {
  return <CrudRouteSkeleton columns={8} filters={6} rows={6} />;
}

export function OrcamentosRouteSkeleton() {
  return <CrudRouteSkeleton columns={5} filters={4} rows={6} />;
}

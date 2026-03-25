"use client";

type SkeletonProps = {
  lines?: number;
  height?: number;
};

export function Skeleton({ lines = 5, height = 40 }: SkeletonProps) {
  return (
    <div className="skeleton-loader w-full space-y-3">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="skeleton-line rounded-[12px]"
          style={{ height: `${height}px` }}
        />
      ))}
    </div>
  );
}

// Skeleton especifico para tabelas (CRUD)
export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="skeleton-loader w-full space-y-4">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="skeleton-line h-6 rounded-[10px]" />
        ))}
      </div>

      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="skeleton-card grid gap-4 rounded-[16px] border border-[#E6EFF1] bg-white p-4"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {Array.from({ length: cols }).map((_, colIndex) => (
            <div key={colIndex} className="skeleton-line h-8 rounded-[10px]" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Skeleton para formulario
export function SkeletonForm() {
  return (
    <div className="skeleton-loader w-full space-y-4">
      <div className="skeleton-line h-5 w-40 rounded-[10px]" />
      <div className="skeleton-card space-y-3 rounded-[16px] border border-[#E6EFF1] bg-white p-4">
        <div className="skeleton-line h-11 rounded-[12px]" />
        <div className="skeleton-line h-11 rounded-[12px]" />
        <div className="skeleton-line h-11 rounded-[12px]" />
        <div className="skeleton-line h-11 rounded-[12px]" />
      </div>
      <div className="skeleton-line h-11 w-36 rounded-[12px]" />
    </div>
  );
}

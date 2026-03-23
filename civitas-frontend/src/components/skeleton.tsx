"use client";

type SkeletonProps = {
  lines?: number;
  height?: number;
};

export function Skeleton({ lines = 5, height = 40 }: SkeletonProps) {
  return (
    <div className="w-full animate-pulse space-y-3">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="bg-gray-300 rounded-md"
          style={{ height: `${height}px` }}
        />
      ))}
    </div>
  );
}

// Skeleton específico para tabelas (CRUD)
export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="w-full animate-pulse space-y-4">
      
      {/* Cabeçalho */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-6 bg-gray-400 rounded-md" />
        ))}
      </div>

      {/* Linhas */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {Array.from({ length: cols }).map((_, colIndex) => (
            <div key={colIndex} className="h-8 bg-gray-300 rounded-md" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Skeleton para formulário
export function SkeletonForm() {
  return (
    <div className="w-full animate-pulse space-y-4">
      <div className="h-10 bg-gray-300 rounded-md" />
      <div className="h-10 bg-gray-300 rounded-md" />
      <div className="h-10 bg-gray-300 rounded-md" />
      <div className="h-10 bg-gray-300 rounded-md" />
      <div className="h-12 bg-gray-400 rounded-md w-32" />
    </div>
  );
}
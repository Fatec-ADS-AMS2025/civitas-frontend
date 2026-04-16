"use client";

type PaginationControlsProps = {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  pageSizeOptions?: number[];
  disabled?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
};

const resolvePageSizeOptions = (pageSize: number, options?: number[]): number[] => {
  return Array.from(new Set([pageSize, ...(options ?? [])])).sort((a, b) => a - b);
};

export default function PaginationControls({
  currentPage,
  totalPages,
  totalRecords,
  pageSize,
  pageSizeOptions,
  disabled = false,
  onPageChange,
  onPageSizeChange,
}: PaginationControlsProps) {
  const displayCurrentPage = Math.max(currentPage, 1);
  const displayTotalPages = Math.max(totalPages, 1);
  const canGoPrevious = displayCurrentPage > 1 && !disabled;
  const canGoNext = displayCurrentPage < displayTotalPages && !disabled;
  const sizeOptions = resolvePageSizeOptions(pageSize, pageSizeOptions);

  return (
    <div className="despesas-table-footer border-t border-[#E5EEF0] px-4 py-4 sm:px-5 lg:px-6">
      <div className="flex flex-col gap-3 text-sm text-[#6B7280] md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <span>{totalRecords} registros</span>
          <span className="inline-flex items-center rounded-full bg-[#F3F9FA] px-3 py-1 font-medium text-[#0B6470]">
            Pagina {displayCurrentPage} de {displayTotalPages}
          </span>

          {onPageSizeChange && sizeOptions.length > 0 ? (
            <label className="flex items-center gap-2">
              <span>Por pagina</span>
              <select
                value={pageSize}
                onChange={(event) => onPageSizeChange(Number(event.target.value))}
                disabled={disabled}
                aria-label="Selecionar quantidade de itens por pagina"
                className="h-[42px] rounded-2xl border border-[#D5E3E6] bg-white px-3 text-sm text-[#1F2A32] outline-none transition focus:border-[#58AFAE] focus:ring-4 focus:ring-[#58AFAE]/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onPageChange(displayCurrentPage - 1)}
            disabled={!canGoPrevious}
            className="h-[42px] rounded-2xl border border-[#D5E3E6] bg-white px-4 font-semibold text-[#1F2A32] transition hover:bg-[#F7FAFB] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={() => onPageChange(displayCurrentPage + 1)}
            disabled={!canGoNext}
            className="h-[42px] rounded-2xl bg-[#58AFAE] px-4 font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Proxima
          </button>
        </div>
      </div>
    </div>
  );
}

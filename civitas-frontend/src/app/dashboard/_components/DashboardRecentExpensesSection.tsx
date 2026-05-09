"use client";

import Input from "@/components/Input";
import PaginationControls from "@/components/PaginationControls";
import { EmptyState } from "@/components/feedback-states";
import type { DespesaDashboardRow } from "@/hooks/useDespesasDashboard";
import { formatCurrency } from "./dashboard.utils";

type DashboardRecentExpensesSectionProps = {
  currentPage: number;
  isPending: boolean;
  items: DespesaDashboardRow[];
  pageSize: number;
  searchTerm: string;
  showMoneyValues: boolean;
  totalPages: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSearchChange: (value: string) => void;
};

export function DashboardRecentExpensesSection({
  currentPage,
  isPending,
  items,
  pageSize,
  searchTerm,
  showMoneyValues,
  totalPages,
  totalRecords,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
}: DashboardRecentExpensesSectionProps) {
  return (
    <article className="civitas-surface p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="inline-flex rounded-sm bg-[#F4F8F9] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7A8B94]">
            Registros
          </span>
          <h2 className="mt-3 text-[20px] font-semibold text-[var(--foreground)]">
            Despesas recentes
          </h2>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">
            Busca local por descricao, documento ou categoria.
          </p>
        </div>

        <div className="w-full max-w-md">
          <Input
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por descricao, documento ou categoria"
            className="dashboard-recent-search"
          />
        </div>
      </div>

      <div className="mt-5">
        {items.length === 0 ? (
          <EmptyState
            title="Nenhuma despesa encontrada"
            description="A busca atual nao retornou despesas para exibicao."
          />
        ) : (
          <>
            <div className="grid gap-3">
              {items.map((item) => (
                <RecentExpenseCard
                  key={item.id}
                  item={item}
                  showMoneyValues={showMoneyValues}
                />
              ))}
            </div>

            <div className="mt-4">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                totalRecords={totalRecords}
                pageSize={pageSize}
                pageSizeOptions={[5, 10, 15]}
                disabled={isPending}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
              />
            </div>
          </>
        )}
      </div>
    </article>
  );
}

function RecentExpenseCard({
  item,
  showMoneyValues,
}: {
  item: DespesaDashboardRow;
  showMoneyValues: boolean;
}) {
  return (
    <div className="grid w-full grid-cols-[1fr_auto] gap-3 rounded-sm border border-[#E7EFF1] bg-[#FCFEFE] px-4 py-3.5 sm:grid-cols-[1fr_auto_auto]">
      <div>
        <p className="text-[15px] font-semibold text-[var(--foreground)]">
          {showMoneyValues ? formatCurrency(item.valor) : "* * * * * *"}
        </p>
        <p className="mt-1 text-sm text-[var(--foreground-muted)]">{item.descricao}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.08em] text-[var(--foreground-soft)]">
          {item.categoria} | {item.registro}
        </p>
      </div>

      <div className="text-right text-sm text-[var(--foreground-muted)]">
        <div>{item.dataFormatada}</div>
        <div>{item.situacaoLabel}</div>
      </div>

      <div className="hidden self-center sm:flex sm:flex-col sm:items-end sm:gap-2">
        <span className="rounded-sm bg-[#FFF1DB] px-4 py-2 text-xs font-semibold text-[#9B5B00]">
          Documento {item.numeroDocumento || "-"}
        </span>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useDashboardHeader } from "@/components/dashboard/dashboard-header";
import { EmptyState, ErrorState } from "@/components/feedback-states";
import Input from "@/components/Input";
import PaginationControls from "@/components/PaginationControls";
import { useClientPagination } from "@/hooks/useClientPagination";
import { type DespesaDashboardRow, useDespesasDashboard } from "@/hooks/useDespesasDashboard";
import { useAppNavigation } from "@/hooks/useNavigationProgress";
import DashboardSkeleton from "./skeleton";

type SummaryRow = {
  label: string;
  value: string;
  helper: string;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
};

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const getDaysUntilDate = (value: string): number | null => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  parsed.setHours(0, 0, 0, 0);

  return Math.round((parsed.getTime() - today.getTime()) / 86_400_000);
};

const getDueSoonLabel = (daysUntilDue: number | null) => {
  if (daysUntilDue === null) return "Sem vencimento";
  if (daysUntilDue < 0) return `Atrasada ha ${Math.abs(daysUntilDue)} dia(s)`;
  if (daysUntilDue === 0) return "Vence hoje";
  return `Vence em ${daysUntilDue} dia(s)`;
};

export default function Dashboard() {
  const router = useAppNavigation();
  const [showMoneyValues, setShowMoneyValues] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { filteredDespesas, orcamentos, instituicoes, fornecedores, usuarios, summary, loading, error, refetch } =
    useDespesasDashboard();

  const hiddenValue = "* * * * * *";

  function verValores() {
    setShowMoneyValues((previous) => !previous);
  }

  const headerConfig = useMemo(
    () => ({
      title: "Dashboard",
      eyebrow: "Visao geral",
      subtitle: "Resumo operacional e financeiro do sistema.",
      breadcrumbs: [{ label: "Home", href: "/dashboard" }, { label: "Dashboard" }],
      actions: [
        {
          label: "Atualizar painel",
          icon: "refresh",
          variant: "primary" as const,
          onClick: () => {
            void refetch();
          },
        },
        {
          label: showMoneyValues ? "Ocultar valores" : "Exibir valores",
          icon: showMoneyValues ? "visibility_off" : "visibility",
          variant: "ghost" as const,
          onClick: () => {
            verValores();
          },
        },
      ],
    }),
    [refetch, showMoneyValues],
  );

  useDashboardHeader(headerConfig);

  const summaryRows = useMemo<SummaryRow[]>(
    () => [
      {
        label: "Saldo atual",
        value: showMoneyValues ? formatCurrency(summary.saldoTotal) : hiddenValue,
        helper: "Orcamentos menos despesas registradas.",
      },
      {
        label: "Total orcado",
        value: showMoneyValues ? formatCurrency(summary.entrada) : hiddenValue,
        helper: `${orcamentos.length} orcamento(s) carregado(s).`,
      },
      {
        label: "Total gasto",
        value: showMoneyValues ? formatCurrency(summary.saida) : hiddenValue,
        helper: `${filteredDespesas.length} despesa(s) na visao atual.`,
      },
      {
        label: "Base ativa",
        value: `${instituicoes.length} instituicoes / ${usuarios.length} usuarios`,
        helper: `${fornecedores.length} fornecedor(es) cadastrado(s).`,
      },
    ],
    [
      filteredDespesas.length,
      fornecedores.length,
      hiddenValue,
      instituicoes.length,
      orcamentos.length,
      showMoneyValues,
      summary.entrada,
      summary.saida,
      summary.saldoTotal,
      usuarios.length,
    ],
  );

  const quickLinks = useMemo(
    () => [
      { label: "Despesas", href: "/dashboard/despesas" },
      { label: "Orcamentos", href: "/dashboard/orcamentos" },
      { label: "Instituicoes", href: "/dashboard/instituicoes" },
      { label: "Fornecedores", href: "/dashboard/fornecedor" },
    ],
    [],
  );

  const filteredRecentExpenses = useMemo(() => {
    const query = normalizeText(searchTerm);

    if (!query) {
      return filteredDespesas;
    }

    return filteredDespesas.filter((item) => {
      return normalizeText(`${item.descricao} ${item.numeroDocumento} ${item.categoria} ${item.id}`).includes(query);
    });
  }, [filteredDespesas, searchTerm]);

  const { currentPage, pageSize, totalPages, totalRecords, paginatedItems, isPending, goToPage, changePageSize } =
    useClientPagination(filteredRecentExpenses, { initialPageSize: 5 });

  const dueSoonExpenses = useMemo(() => {
    return filteredDespesas
      .map((item) => ({
        ...item,
        daysUntilDue: getDaysUntilDate(item.raw.dataVencimento ?? item.data),
      }))
      .filter((item) => item.daysUntilDue !== null && item.daysUntilDue <= 7)
      .sort((a, b) => (a.daysUntilDue ?? 999) - (b.daysUntilDue ?? 999))
      .slice(0, 5);
  }, [filteredDespesas]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <ErrorState
        title="Nao foi possivel carregar a dashboard"
        description={error}
        actionLabel="Atualizar painel"
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="space-y-5">
      <section className="civitas-surface civitas-enter px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-sm border border-[var(--border-default)] bg-[var(--surface-subtle)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-soft)]">
              Painel principal
            </span>
            <h2 className="mt-3 text-[22px] font-semibold text-[var(--secundary-1)] sm:text-[24px]">Operacao direta</h2>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              Resumo financeiro, acessos centrais e fila recente de despesas sem blocos duplicados.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {quickLinks.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => router.push(link.href)}
                className="rounded-sm border border-[var(--border-default)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-subtle)] focus:outline-none focus:ring-4 focus:ring-black/5"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 divide-y divide-[var(--border-soft)]">
          {summaryRows.map((item) => (
            <div key={item.label} className="grid gap-2 py-3 sm:grid-cols-[180px_1fr] sm:items-center">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-soft)]">
                {item.label}
              </span>
              <div>
                <div className="flex gap-3">
                  <p className="text-base font-semibold text-[var(--foreground)]">{item.value}</p>

                  {!item.label.toLocaleLowerCase().includes("base ativa") && (
                    <button type="button" onClick={verValores}>
                      {item.value === hiddenValue ? (
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      ) : (
                        <span className="material-symbols-outlined text-[20px]">visibility_off</span>
                      )}
                    </button>
                  )}
                </div>
                <p className="mt-1 text-sm text-[var(--foreground-muted)]">{item.helper}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="civitas-surface p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex rounded-sm bg-[#F4F8F9] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7A8B94]">
                Registros
              </span>
              <h2 className="mt-3 text-[20px] font-semibold text-[var(--foreground)]">Despesas recentes</h2>
              <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                Busca local por descricao, documento ou categoria.
              </p>
            </div>

            <div className="w-full max-w-md">
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por descricao, documento ou categoria"
                className="dashboard-recent-search"
              />
            </div>
          </div>

          <div className="mt-5">
            {paginatedItems.length === 0 ? (
              <EmptyState
                title="Nenhuma despesa encontrada"
                description="A busca atual nao retornou despesas para exibicao."
              />
            ) : (
              <>
                <div className="grid gap-3">
                  {paginatedItems.map((item) => (
                    <RecentExpenseCard key={item.id} item={item} showMoneyValues={showMoneyValues} />
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
                    onPageChange={goToPage}
                    onPageSizeChange={changePageSize}
                  />
                </div>
              </>
            )}
          </div>
        </article>

        <article className="civitas-surface p-5">
          <span className="inline-flex rounded-sm bg-[#FFF0DD] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9B5B00]">
            Prioridades
          </span>
          <h2 className="mt-3 text-[20px] font-semibold text-[var(--foreground)]">Vencimentos proximos</h2>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">Despesas com vencimento em ate 7 dias.</p>

          <div className="mt-5 space-y-3">
            {dueSoonExpenses.length === 0 ? (
              <EmptyState
                title="Sem vencimentos proximos"
                description="Nenhuma despesa filtrada vence nos proximos 7 dias."
              />
            ) : (
              dueSoonExpenses.map((item) => (
                <div key={`due-${item.id}`} className="rounded-sm border border-[#E7EFF1] bg-[#FCFEFE] px-4 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">{item.descricao}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.08em] text-[var(--foreground-soft)]">
                        {item.categoria}
                      </p>
                    </div>
                    <span className="rounded-sm bg-[#FFF1DB] px-3 py-1 text-xs font-semibold text-[#9B5B00]">
                      {getDueSoonLabel(item.daysUntilDue)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                    <span className="text-[var(--foreground-muted)]">
                      Vencimento: {formatDate(item.raw.dataVencimento ?? item.data)}
                    </span>
                    <span className="font-semibold text-[var(--secundary-1)]">
                      {showMoneyValues ? formatCurrency(item.valor) : hiddenValue}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </div>
  );
}

function RecentExpenseCard({ item, showMoneyValues }: { item: DespesaDashboardRow; showMoneyValues: boolean }) {
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

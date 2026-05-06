"use client";

import React, { useMemo, useState } from "react";
import Input from "@/components/Input";
import PaginationControls from "@/components/PaginationControls";
import { EmptyState, ErrorState } from "@/components/feedback-states";
import { useDashboardHeader } from "@/components/dashboard/dashboard-header";
import { SITUACAO_ATIVO } from "@/global/situacao";
import { useAppNavigation } from "@/hooks/useNavigationProgress";
import { useClientPagination } from "@/hooks/useClientPagination";
import {
  type DespesaDashboardRow,
  useDespesasDashboard,
} from "@/hooks/useDespesasDashboard";
import DashboardSkeleton from "./skeleton";

type ActionTone = "amber" | "blue" | "slate";

type QuickAction = {
  title: string;
  subtitle: string;
  button: string;
  tone: ActionTone;
  icon: string;
  onClick: () => void;
};

type RankedItem = {
  id: string;
  label: string;
  value: number;
  count?: number;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const formatCompactCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 1,
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

const buildCategoryRanking = (despesas: DespesaDashboardRow[]): RankedItem[] => {
  const grouped = despesas.reduce<Map<string, RankedItem>>((acc, item) => {
    const current = acc.get(item.categoria) ?? {
      id: item.categoria,
      label: item.categoria,
      value: 0,
      count: 0,
    };

    current.value += item.valor;
    current.count = (current.count ?? 0) + 1;
    acc.set(item.categoria, current);
    return acc;
  }, new Map());

  return Array.from(grouped.values()).sort((a, b) => b.value - a.value).slice(0, 5);
};

const buildInstitutionRanking = (
  despesas: DespesaDashboardRow[],
  instituicoes: Array<{ id: number; nome: string }>
): RankedItem[] => {
  const institutionMap = new Map(instituicoes.map((item) => [item.id, item.nome]));

  const grouped = despesas.reduce<Map<number, RankedItem>>((acc, item) => {
    const instituicaoId = item.raw.idInstituicao ?? 0;
    const label =
      institutionMap.get(instituicaoId) ??
      (instituicaoId > 0 ? `Instituicao #${instituicaoId}` : "Nao vinculada");

    const current = acc.get(instituicaoId) ?? {
      id: String(instituicaoId),
      label,
      value: 0,
      count: 0,
    };

    current.value += item.valor;
    current.count = (current.count ?? 0) + 1;
    acc.set(instituicaoId, current);
    return acc;
  }, new Map());

  return Array.from(grouped.values()).sort((a, b) => b.value - a.value).slice(0, 5);
};

export default function Dashboard() {
  const router = useAppNavigation();
  const [showMoneyValues, setShowMoneyValues] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    despesas,
    filteredDespesas,
    orcamentos,
    instituicoes,
    fornecedores,
    usuarios,
    summary,
    loading,
    error,
    refetch,
  } = useDespesasDashboard();

  const headerConfig = useMemo(
    () => ({
      title: "Dashboard",
      eyebrow: "Visao geral",
      subtitle: "Resumo operacional e financeiro do sistema.",
      breadcrumbs: [
        { label: "Home", href: "/dashboard" },
        { label: "Dashboard" },
      ],
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
            setShowMoneyValues((previous) => !previous);
          },
        },
      ],
    }),
    [refetch, showMoneyValues]
  );

  useDashboardHeader(headerConfig);

  const quickActions = useMemo<QuickAction[]>(
    () => [
      {
        title: `${filteredDespesas.length} despesas disponiveis`,
        subtitle: "Consultar registros e filtros.",
        button: "Abrir despesas",
        tone: "amber",
        icon: "receipt_long",
        onClick: () => router.push("/dashboard/despesas"),
      },
      {
        title: `${orcamentos.length} orcamentos carregados`,
        subtitle: "Revisar previsao orcamentaria.",
        button: "Ver orcamentos",
        tone: "blue",
        icon: "fact_check",
        onClick: () => router.push("/dashboard/orcamentos"),
      },
      {
        title: `${instituicoes.length} instituicoes cadastradas`,
        subtitle: "Abrir painel financeiro.",
        button: "Ir ao financeiro",
        tone: "slate",
        icon: "bar_chart",
        onClick: () => router.push("/dashboard/financeiro"),
      },
    ],
    [filteredDespesas.length, instituicoes.length, orcamentos.length, router]
  );

  const filteredRecentExpenses = useMemo(() => {
    const query = normalizeText(searchTerm);

    if (!query) {
      return filteredDespesas;
    }

    return filteredDespesas.filter((item) => {
      return normalizeText(
        `${item.descricao} ${item.numeroDocumento} ${item.categoria} ${item.id}`
      ).includes(query);
    });
  }, [filteredDespesas, searchTerm]);

  const {
    currentPage,
    pageSize,
    totalPages,
    totalRecords,
    paginatedItems,
    isPending,
    goToPage,
    changePageSize,
  } = useClientPagination(filteredRecentExpenses, { initialPageSize: 5 });

  const categoryRanking = useMemo(
    () => buildCategoryRanking(filteredDespesas),
    [filteredDespesas]
  );

  const institutionRanking = useMemo(
    () => buildInstitutionRanking(filteredDespesas, instituicoes),
    [filteredDespesas, instituicoes]
  );

  const activeExpenses = useMemo(
    () => despesas.filter((item) => item.situacao === SITUACAO_ATIVO).length,
    [despesas]
  );

  const inactiveExpenses = useMemo(
    () => despesas.filter((item) => item.situacao !== SITUACAO_ATIVO).length,
    [despesas]
  );

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

  const hiddenValue = "* * * * * *";

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
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="inline-flex rounded-sm border border-[var(--border-default)] bg-[var(--surface-subtle)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-soft)]">
              Painel geral
            </span>
            <h2 className="mt-3 text-[22px] font-semibold text-[var(--secundary-1)] sm:text-[24px]">
              Acompanhamento consolidado
            </h2>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              Indicadores, atalhos e registros recentes do sistema.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <HeaderStat label="Despesas" value={filteredDespesas.length} />
            <HeaderStat label="Instituicoes" value={instituicoes.length} />
            <HeaderStat label="Usuarios" value={usuarios.length} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        <MetricCard
          title="Saldo atual"
          subtitle="Orcamentos menos despesas"
          value={showMoneyValues ? formatCurrency(summary.saldoTotal) : hiddenValue}
          icon="account_balance_wallet"
        />
        <MetricCard
          title="Total orcado"
          subtitle="Base financeira"
          value={showMoneyValues ? formatCurrency(summary.entrada) : hiddenValue}
          icon="savings"
        />
        <MetricCard
          title="Total gasto"
          subtitle="Despesas registradas"
          value={showMoneyValues ? formatCurrency(summary.saida) : hiddenValue}
          icon="payments"
        />
        <MetricCard
          title="Cobertura"
          subtitle="Situacao das despesas"
          value={`${activeExpenses} ativas / ${inactiveExpenses} inativas`}
          icon="inventory"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="civitas-surface p-5">
          <span className="civitas-chip civitas-chip--amber px-3 py-1 text-[11px] tracking-[0.08em]">
            Acoes rapidas
          </span>
          <h2 className="mt-3 text-[20px] font-semibold text-[var(--foreground)]">
            Acessos diretos
          </h2>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">
            Atalhos para os modulos mais usados.
          </p>

          <div className="mt-4 space-y-3">
            {quickActions.map((action) => (
              <ActionCard key={action.title} action={action} />
            ))}
          </div>
        </article>

        <article className="civitas-surface p-5">
          <span className="civitas-chip civitas-chip--teal px-3 py-1 text-[11px] tracking-[0.08em]">
            Panorama
          </span>
          <h2 className="mt-3 text-[20px] font-semibold text-[var(--foreground)]">
            Cadastros ativos
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <OverviewCard
              label="Instituicoes"
              value={instituicoes.length}
              icon="corporate_fare"
            />
            <OverviewCard
              label="Fornecedores"
              value={fornecedores.length}
              icon="storefront"
            />
            <OverviewCard label="Usuarios" value={usuarios.length} icon="group" />
            <OverviewCard
              label="Despesas filtradas"
              value={filteredDespesas.length}
              icon="receipt"
            />
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <RankingCard
          title="Categorias com maior impacto"
          subtitle="Soma das despesas por categoria."
          emptyTitle="Nenhuma categoria encontrada"
          emptyDescription="Ainda nao ha despesas suficientes para montar o ranking."
          items={categoryRanking}
          totalBase={summary.saida}
        />

        <RankingCard
          title="Instituicoes com maior gasto"
          subtitle="Acumulado de despesas por instituicao."
          emptyTitle="Nenhuma instituicao ranqueada"
          emptyDescription="As despesas atuais nao possuem agrupamento suficiente."
          items={institutionRanking}
          totalBase={summary.saida}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <article className="civitas-surface p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="civitas-chip civitas-chip--slate px-3 py-1 text-[11px] tracking-[0.08em]">
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
                    onPageChange={goToPage}
                    onPageSizeChange={changePageSize}
                  />
                </div>
              </>
            )}
          </div>
        </article>

        <article className="civitas-surface p-5">
          <span className="civitas-chip civitas-chip--amber px-3 py-1 text-[11px] tracking-[0.08em]">
            Prioridades
          </span>
          <h2 className="mt-3 text-[20px] font-semibold text-[var(--foreground)]">
            Vencimentos proximos
          </h2>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">
            Despesas com vencimento em ate 7 dias.
          </p>

          <div className="mt-5 space-y-3">
            {dueSoonExpenses.length === 0 ? (
              <EmptyState
                title="Sem vencimentos proximos"
                description="Nenhuma despesa filtrada vence nos proximos 7 dias."
              />
            ) : (
              dueSoonExpenses.map((item) => (
                <div
                  key={`due-${item.id}`}
                  className="civitas-card-soft px-4 py-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">
                        {item.descricao}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.08em] text-[var(--foreground-soft)]">
                        {item.categoria}
                      </p>
                    </div>
                    <span className="civitas-chip civitas-chip--amber px-3 py-1 text-xs">
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

function MetricCard({
  title,
  subtitle,
  value,
  icon,
}: {
  title: string;
  subtitle: string;
  value: string;
  icon: string;
}) {
  return (
    <article className="dashboard-metric-card civitas-surface flex h-full flex-col p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--foreground-soft)]">
            Indicador
          </p>
          <h2 className="mt-3 text-base font-semibold text-[var(--foreground)]">{title}</h2>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">{subtitle}</p>
        </div>
        <span className="dashboard-metric-card__icon flex h-11 w-11 items-center justify-center rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] text-[var(--secundary-1)]">
          <span className="material-symbols-outlined !text-[22px]">{icon}</span>
        </span>
      </div>

      <div className="dashboard-metric-card__value mt-4 rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] px-4 py-3 text-lg font-semibold text-[var(--secundary-1)]">
        {value}
      </div>
    </article>
  );
}

function HeaderStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.1em] text-[var(--foreground-soft)]">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold text-[var(--secundary-1)]">{value}</p>
    </div>
  );
}

function OverviewCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="civitas-card-soft px-4 py-3.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-[var(--foreground-muted)]">{label}</span>
        <span className="material-symbols-outlined !text-[18px] text-[var(--secundary-1)]">
          {icon}
        </span>
      </div>
      <p className="mt-2 text-[24px] font-semibold leading-none text-[var(--foreground)]">
        {value}
      </p>
    </div>
  );
}

function RankingCard({
  title,
  subtitle,
  emptyTitle,
  emptyDescription,
  items,
  totalBase,
}: {
  title: string;
  subtitle: string;
  emptyTitle: string;
  emptyDescription: string;
  items: RankedItem[];
  totalBase: number;
}) {
  return (
    <article className="civitas-surface p-5">
      <h2 className="text-[18px] font-semibold text-[var(--foreground)]">{title}</h2>
      <p className="mt-1 text-sm text-[var(--foreground-muted)]">{subtitle}</p>

      <div className="mt-5 space-y-4">
        {items.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : (
          items.map((item, index) => (
            <div key={item.id}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <span className="text-sm font-semibold text-[var(--foreground)]">
                    {index + 1}. {item.label}
                  </span>
                  <p className="mt-1 text-xs text-[var(--foreground-soft)]">
                    {item.count ?? 0} registro(s)
                  </p>
                </div>
                <span className="text-sm font-semibold text-[var(--secundary-1)]">
                  {formatCompactCurrency(item.value)}
                </span>
              </div>
              <div className="h-2 rounded-sm bg-[var(--surface-subtle)]">
                <div
                  className="h-2 rounded-sm bg-[var(--primary-1)]"
                  style={{
                    width: `${Math.min(
                      (item.value / Math.max(totalBase, 1)) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))
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
    <div className="civitas-card-soft grid w-full grid-cols-[1fr_auto] gap-3 px-4 py-3.5 sm:grid-cols-[1fr_auto_auto]">
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
        <span className="civitas-chip civitas-chip--amber px-4 py-2 text-xs">
          Documento {item.numeroDocumento || "-"}
        </span>
      </div>
    </div>
  );
}

function ActionCard({ action }: { action: QuickAction }) {
  const toneClasses = {
    amber: "civitas-card-soft civitas-card-soft--amber",
    blue: "civitas-card-soft civitas-card-soft--teal",
    slate: "civitas-card-soft civitas-card-soft--slate",
  } as const;

  return (
    <div
      className={`flex flex-col gap-4 px-4 py-3.5 sm:flex-row sm:items-center ${toneClasses[action.tone]}`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-[var(--surface-elevated)] text-[var(--secundary-1)]">
        <span className="material-symbols-outlined !text-[20px]">
          {action.icon}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-[var(--foreground)]">
          {action.title}
        </p>
        <p className="mt-1 text-sm text-[var(--foreground-muted)]">{action.subtitle}</p>
      </div>
      <button
        type="button"
        onClick={action.onClick}
        className="civitas-action civitas-action--ghost w-full px-4 py-2 text-sm sm:w-auto"
      >
        {action.button}
      </button>
    </div>
  );
}

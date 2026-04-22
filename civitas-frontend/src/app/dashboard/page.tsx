"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/Input";
import PaginationControls from "@/components/PaginationControls";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/feedback-states";
import { SITUACAO_ATIVO } from "@/global/situacao";
import { useClientPagination } from "@/hooks/useClientPagination";
import {
  type DespesaDashboardRow,
  useDespesasDashboard,
} from "@/hooks/useDespesasDashboard";

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
  const router = useRouter();
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

  const quickActions = useMemo<QuickAction[]>(
    () => [
      {
        title: `${filteredDespesas.length} despesas disponiveis`,
        subtitle: "Acesse a listagem completa e aplique filtros operacionais.",
        button: "Abrir despesas",
        tone: "amber",
        icon: "receipt_long",
        onClick: () => router.push("/dashboard/despesas"),
      },
      {
        title: `${orcamentos.length} orcamentos carregados`,
        subtitle: "Revise rapidamente previsao orcamentaria e cobertura.",
        button: "Ver orcamentos",
        tone: "blue",
        icon: "fact_check",
        onClick: () => router.push("/dashboard/orcamentos"),
      },
      {
        title: `${instituicoes.length} instituicoes cadastradas`,
        subtitle: "Navegue para o painel financeiro consolidado do sistema.",
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
    return <LoadingState description="Carregando painel inicial com dados do backend..." />;
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
    <div className="space-y-6">
      <section className="rounded-[30px] bg-[#2B8F95] px-6 py-7 text-white shadow-[0_18px_32px_rgba(11,100,112,0.18)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]">
              Dashboard operacional
            </span>
            <h1 className="mt-4 text-[32px] font-bold leading-tight sm:text-[40px]">
              Acompanhamento real de despesas e cobertura orcamentaria
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-white/85 sm:text-base">
              Esta tela agora usa dados reais do backend para mostrar saldo, volume
              de despesas, concentracao por categoria e vencimentos proximos.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => void refetch()}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold transition hover:bg-white/15 focus:outline-none focus:ring-4 focus:ring-white/20"
            >
              <span className="material-symbols-outlined !text-[18px]">refresh</span>
              Atualizar dados
            </button>

            <button
              type="button"
              onClick={() => setShowMoneyValues((previous) => !previous)}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold transition hover:bg-white/15 focus:outline-none focus:ring-4 focus:ring-white/20"
            >
              <span className="material-symbols-outlined !text-[18px]">
                {showMoneyValues ? "visibility_off" : "visibility"}
              </span>
              {showMoneyValues ? "Ocultar valores" : "Exibir valores"}
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-4">
        <MetricCard
          title="Saldo atual"
          subtitle="Orcamentos menos despesas"
          value={showMoneyValues ? formatCurrency(summary.saldoTotal) : hiddenValue}
          gradient="linear-gradient(135deg, #0D7C7C 0%, #66B8B7 100%)"
          icon="account_balance_wallet"
        />
        <MetricCard
          title="Total orcado"
          subtitle="Base financeira carregada"
          value={showMoneyValues ? formatCurrency(summary.entrada) : hiddenValue}
          gradient="linear-gradient(135deg, #1D1D1D 0%, #555555 100%)"
          icon="savings"
        />
        <MetricCard
          title="Total gasto"
          subtitle="Despesas encontradas"
          value={showMoneyValues ? formatCurrency(summary.saida) : hiddenValue}
          gradient="linear-gradient(135deg, #F18B1B 0%, #FFB354 100%)"
          icon="payments"
        />
        <MetricCard
          title="Cobertura"
          subtitle="Despesa ativa x estoque cadastral"
          value={`${activeExpenses} ativas / ${inactiveExpenses} inativas`}
          gradient="linear-gradient(135deg, #28455A 0%, #5B7D91 100%)"
          icon="inventory"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[28px] border border-[#E4EEF0] bg-white p-5 shadow-[0_12px_28px_rgba(0,0,0,0.05)]">
          <span className="inline-flex rounded-full bg-[#FFF0DD] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#F0A126]">
            Acoes rapidas
          </span>
          <h2 className="mt-4 text-[26px] font-bold text-[#1F2A32]">
            Entradas diretas para operacao
          </h2>
          <p className="mt-2 text-sm text-[#72808A]">
            Atalhos baseados no volume real atualmente carregado pela API.
          </p>

          <div className="mt-5 space-y-3">
            {quickActions.map((action) => (
              <ActionCard key={action.title} action={action} />
            ))}
          </div>
        </article>

        <article className="rounded-[28px] border border-[#E4EEF0] bg-white p-5 shadow-[0_12px_28px_rgba(0,0,0,0.05)]">
          <span className="inline-flex rounded-full bg-[#EAF4F5] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#0B6470]">
            Panorama
          </span>
          <h2 className="mt-4 text-[26px] font-bold text-[#1F2A32]">
            Leitura rapida do cadastro
          </h2>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
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
            <OverviewCard
              label="Usuarios"
              value={usuarios.length}
              icon="group"
            />
            <OverviewCard
              label="Despesas filtradas"
              value={filteredDespesas.length}
              icon="receipt"
            />
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
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

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <article className="rounded-[28px] border border-[#E4EEF0] bg-white p-5 shadow-[0_12px_28px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex rounded-full bg-[#F4F8F9] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#7A8B94]">
                Ultimos registros
              </span>
              <h2 className="mt-4 text-[26px] font-bold text-[#1F2A32]">
                Despesas recentes
              </h2>
              <p className="mt-2 text-sm text-[#72808A]">
                Busca local por descricao, documento ou categoria dentro das
                despesas carregadas pelo backend.
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

          <div className="mt-6">
            {paginatedItems.length === 0 ? (
              <EmptyState
                title="Nenhuma despesa encontrada"
                description="A busca atual nao retornou despesas para exibir."
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

                <div className="mt-5">
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

        <article className="rounded-[28px] border border-[#E4EEF0] bg-white p-5 shadow-[0_12px_28px_rgba(0,0,0,0.05)]">
          <span className="inline-flex rounded-full bg-[#FFF0DD] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#F0A126]">
            Prioridades
          </span>
          <h2 className="mt-4 text-[26px] font-bold text-[#1F2A32]">
            Vencimentos proximos
          </h2>
          <p className="mt-2 text-sm text-[#72808A]">
            Despesas com vencimento em ate 7 dias, calculadas a partir dos dados
            recebidos.
          </p>

          <div className="mt-6 space-y-3">
            {dueSoonExpenses.length === 0 ? (
              <EmptyState
                title="Sem vencimentos proximos"
                description="Nenhuma despesa filtrada vence nos proximos 7 dias."
              />
            ) : (
              dueSoonExpenses.map((item) => (
                <div
                  key={`due-${item.id}`}
                  className="rounded-[18px] border border-[#E7EFF1] bg-[#FCFEFE] px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#1F2A32]">
                        {item.descricao}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.08em] text-[#90A0A8]">
                        {item.categoria}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#FFF1DB] px-3 py-1 text-xs font-semibold text-[#C97900]">
                      {getDueSoonLabel(item.daysUntilDue)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                    <span className="text-[#72808A]">
                      Vencimento: {formatDate(item.raw.dataVencimento ?? item.data)}
                    </span>
                    <span className="font-semibold text-[#0B6470]">
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
  gradient,
  icon,
}: {
  title: string;
  subtitle: string;
  value: string;
  gradient: string;
  icon: string;
}) {
  return (
    <article
      className="dashboard-metric-card relative flex h-full flex-col overflow-hidden rounded-[24px] p-5 text-white shadow-[0_14px_35px_rgba(0,0,0,0.12)]"
      style={{ background: gradient }}
    >
      <div className="dashboard-metric-card__sheen absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent_56%)]" />
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/75">
            Conta digital
          </p>
          <h2 className="mt-5 text-[26px] font-semibold leading-none">{title}</h2>
          <p className="mt-2 text-sm text-white/80">{subtitle}</p>
        </div>
        <span className="dashboard-metric-card__icon flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
          <span className="material-symbols-outlined !text-[32px] opacity-80">
            {icon}
          </span>
        </span>
      </div>

      <div className="dashboard-metric-card__value relative z-10 mt-auto pt-6 rounded-2xl border border-white/10 bg-white/14 px-4 py-3 text-lg font-semibold tracking-[0.04em]">
        {value}
      </div>
    </article>
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
    <div className="rounded-[20px] border border-[#E7EFF1] bg-[#FBFEFE] px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-[#6F7E87]">{label}</span>
        <span className="material-symbols-outlined !text-[20px] text-[#0B6470]">
          {icon}
        </span>
      </div>
      <p className="mt-3 text-[28px] font-bold leading-none text-[#1F2A32]">
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
    <article className="rounded-[28px] border border-[#E4EEF0] bg-white p-5 shadow-[0_12px_28px_rgba(0,0,0,0.05)]">
      <h2 className="text-[24px] font-bold text-[#1F2A32]">{title}</h2>
      <p className="mt-2 text-sm text-[#72808A]">{subtitle}</p>

      <div className="mt-6 space-y-4">
        {items.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : (
          items.map((item, index) => (
            <div key={item.id}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <span className="text-sm font-semibold text-[#1F2A32]">
                    {index + 1}. {item.label}
                  </span>
                  <p className="mt-1 text-xs text-[#7B8A93]">
                    {item.count ?? 0} registro(s)
                  </p>
                </div>
                <span className="text-sm font-semibold text-[#0B6470]">
                  {formatCompactCurrency(item.value)}
                </span>
              </div>
              <div className="h-3 rounded-full bg-[#EEF4F5]">
                <div
                  className="h-3 rounded-full bg-[linear-gradient(90deg,#0D7C7C_0%,#64B7B3_100%)]"
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
    <div className="grid w-full grid-cols-[1fr_auto] gap-3 rounded-[18px] border border-[#E7EFF1] bg-[#FCFEFE] px-4 py-4 sm:grid-cols-[1fr_auto_auto]">
      <div>
        <p className="text-[15px] font-bold text-[#1F2A32]">
          {showMoneyValues ? formatCurrency(item.valor) : "* * * * * *"}
        </p>
        <p className="mt-1 text-sm text-[#5B6770]">{item.descricao}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.08em] text-[#90A0A8]">
          {item.categoria} • {item.registro}
        </p>
      </div>

      <div className="text-right text-sm text-[#6B7280]">
        <div>{item.dataFormatada}</div>
        <div>{item.situacaoLabel}</div>
      </div>

      <div className="hidden self-center sm:flex sm:flex-col sm:items-end sm:gap-2">
        <span className="rounded-full bg-[#FFF1DB] px-4 py-2 text-xs font-semibold text-[#F0A126]">
          Documento {item.numeroDocumento || "-"}
        </span>
      </div>
    </div>
  );
}

function ActionCard({ action }: { action: QuickAction }) {
  const toneClasses = {
    amber: "border-[#F6E2BA] bg-[#FFF7E8]",
    blue: "border-[#D9E8FF] bg-[#EFF5FF]",
    slate: "border-[#D9E2E6] bg-[#F5F8F9]",
  } as const;

  const buttonClasses = {
    amber: "bg-[#FFAA17] text-white",
    blue: "bg-[#4A8FF7] text-white",
    slate: "bg-[#1D2940] text-white",
  } as const;

  return (
    <div
      className={`flex items-center gap-4 rounded-[20px] border px-4 py-4 ${toneClasses[action.tone]}`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/70">
        <span className="material-symbols-outlined !text-[22px]">
          {action.icon}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-[#1F2A32]">
          {action.title}
        </p>
        <p className="mt-1 text-sm text-[#72808A]">{action.subtitle}</p>
      </div>
      <button
        type="button"
        onClick={action.onClick}
        className={`rounded-full px-5 py-2 text-sm font-bold transition hover:brightness-95 focus:outline-none focus:ring-4 focus:ring-black/5 ${buttonClasses[action.tone]}`}
      >
        {action.button}
      </button>
    </div>
  );
}

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/Input";
import PaginationControls from "@/components/PaginationControls";
import { EmptyState, ErrorState, LoadingState } from "@/components/feedback-states";
import { useClientPagination } from "@/hooks/useClientPagination";
import { showToast } from "@/hooks/useToast";

type QuickAction = {
  title: string;
  subtitle: string;
  button: string;
  tone: "amber" | "blue" | "slate";
  icon: string;
  onClick: () => void;
};

type DashboardExpense = {
  id: number;
  value: number;
  label: string;
  category: string;
  date: string;
  time: string;
};

const dashboardExpensesSeed: DashboardExpense[] = [
  { id: 1, value: -539, label: "Area da saude", category: "Saude", date: "2026-03-17", time: "08:17" },
  { id: 2, value: -777, label: "Secretaria municipal", category: "Administrativo", date: "2026-03-17", time: "08:17" },
  { id: 3, value: -4000, label: "Reformas", category: "Infraestrutura", date: "2026-03-16", time: "08:15" },
  { id: 4, value: -777.07, label: "Sabesp", category: "Utilidades", date: "2026-03-16", time: "06:10" },
  { id: 5, value: 777777.77, label: "Recebimento de verba", category: "Receita", date: "2026-03-15", time: "06:09" },
  { id: 6, value: -1280.35, label: "Material escolar", category: "Educacao", date: "2026-03-14", time: "10:32" },
  { id: 7, value: -950, label: "Transporte escolar", category: "Transporte", date: "2026-03-13", time: "09:41" },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));

export default function Dashboard() {
  const router = useRouter();
  const [showMoneyValues, setShowMoneyValues] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expenses, setExpenses] = useState<DashboardExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const quickActions: QuickAction[] = useMemo(
    () => [
      {
        title: "Areas com maior consumo",
        subtitle: "Acompanhe os gastos mais sensiveis da semana.",
        button: "Ver despesas",
        tone: "amber",
        icon: "warning",
        onClick: () => router.push("/dashboard/despesas"),
      },
      {
        title: "Solicitacoes de verba",
        subtitle: "Revise os orcamentos pendentes em um unico fluxo.",
        button: "Revisar",
        tone: "blue",
        icon: "fact_check",
        onClick: () => router.push("/dashboard/orcamentos"),
      },
      {
        title: "Painel financeiro",
        subtitle: "Compare entradas, saidas e saldo consolidado.",
        button: "Abrir",
        tone: "slate",
        icon: "bar_chart",
        onClick: () => router.push("/dashboard/financeiro"),
      },
    ],
    [router]
  );

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await new Promise((resolve) => setTimeout(resolve, 250));
      setExpenses(dashboardExpensesSeed);
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : "Nao foi possivel carregar o extrato da dashboard.";
      setError(message);
      setExpenses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboardData();
  }, []);

  const filteredExpenses = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();

    if (!normalizedQuery) {
      return expenses;
    }

    return expenses.filter((item) => {
      return (
        item.label.toLowerCase().includes(normalizedQuery) ||
        item.category.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [expenses, searchTerm]);

  const {
    currentPage,
    pageSize,
    totalPages,
    totalRecords,
    paginatedItems,
    isPending,
    goToPage,
    changePageSize,
    resetPagination,
  } = useClientPagination(filteredExpenses, { initialPageSize: 4 });

  useEffect(() => {
    resetPagination();
  }, [searchTerm, resetPagination]);

  const totalAvailable = expenses.filter((item) => item.value > 0).reduce((acc, item) => acc + item.value, 0);
  const totalExpenses = Math.abs(expenses.filter((item) => item.value < 0).reduce((acc, item) => acc + item.value, 0));
  const balance = totalAvailable - totalExpenses;
  const hiddenValue = "* * * * * *";

  const categoryHighlights = useMemo(() => {
    const grouped = filteredExpenses
      .filter((item) => item.value < 0)
      .reduce<Record<string, number>>((acc, item) => {
        acc[item.category] = (acc[item.category] ?? 0) + Math.abs(item.value);
        return acc;
      }, {});

    return Object.entries(grouped)
      .sort(([, previous], [, next]) => next - previous)
      .slice(0, 4);
  }, [filteredExpenses]);

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] bg-[linear-gradient(135deg,#0D7A7C_0%,#63B6B2_45%,#EAF5F5_100%)] px-6 py-7 text-white shadow-[0_18px_32px_rgba(11,100,112,0.18)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]">
              Visao geral
            </span>
            <h1 className="mt-4 text-[32px] font-bold leading-tight sm:text-[40px]">Painel central de acompanhamento</h1>
            <p className="mt-3 max-w-2xl text-sm text-white/85 sm:text-base">
              Consolide saldo, gastos recentes e atalhos operacionais em uma mesma experiencia visual.
            </p>
          </div>

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
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <MetricCard title="Valor disponivel" subtitle="Saldo consolidado para operacao" value={showMoneyValues ? formatCurrency(totalAvailable) : hiddenValue} gradient="linear-gradient(135deg, #0D7C7C 0%, #66B8B7 100%)" icon="account_balance" />
        <MetricCard title="Balanca" subtitle="Entradas menos saidas acumuladas" value={showMoneyValues ? formatCurrency(balance) : hiddenValue} gradient="linear-gradient(135deg, #1D1D1D 0%, #555555 100%)" icon="balance" />
        <MetricCard title="Gastos totais" subtitle="Movimentacoes negativas do periodo" value={showMoneyValues ? formatCurrency(totalExpenses) : hiddenValue} gradient="linear-gradient(135deg, #F18B1B 0%, #FFB354 100%)" icon="monetization_on" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[28px] border border-[#E4EEF0] bg-white p-5 shadow-[0_12px_28px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="inline-flex rounded-full bg-[#FFF0DD] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#F0A126]">
                Acoes rapidas
              </span>
              <h2 className="mt-4 text-[26px] font-bold text-[#1F2A32]">Fluxos mais usados da sprint</h2>
              <p className="mt-2 text-sm text-[#72808A]">Atalhos para navegar entre analise, despesas e financeiro sem perder contexto.</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {quickActions.map((action) => (
              <ActionCard key={action.title} action={action} />
            ))}
          </div>
        </article>

        <article className="rounded-[28px] border border-[#E4EEF0] bg-white p-5 shadow-[0_12px_28px_rgba(0,0,0,0.05)]">
          <span className="inline-flex rounded-full bg-[#EAF4F5] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#0B6470]">
            Destaques do periodo
          </span>
          <h2 className="mt-4 text-[26px] font-bold text-[#1F2A32]">Categorias com maior impacto</h2>
          <p className="mt-2 text-sm text-[#72808A]">As categorias abaixo usam os mesmos dados exibidos no extrato recente.</p>

          <div className="mt-6 space-y-4">
            {categoryHighlights.length > 0 ? (
              categoryHighlights.map(([category, value], index) => (
                <div key={category}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-[#1F2A32]">
                      {index + 1}. {category}
                    </span>
                    <span className="text-sm font-semibold text-[#0B6470]">{formatCurrency(value)}</span>
                  </div>
                  <div className="h-3 rounded-full bg-[#EEF4F5]">
                    <div
                      className="h-3 rounded-full bg-[linear-gradient(90deg,#0D7C7C_0%,#64B7B3_100%)]"
                      style={{ width: `${Math.min((value / Math.max(totalExpenses, 1)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title="Sem categorias para exibir"
                description="Ajuste o filtro do extrato para visualizar outro recorte das movimentacoes."
              />
            )}
          </div>
        </article>
      </section>

      <section className="overflow-hidden rounded-[28px] border border-[#E4EEF0] bg-white shadow-[0_12px_28px_rgba(0,0,0,0.05)]">
        <div className="border-b border-[#EAF1F2] px-5 py-5 lg:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <span className="inline-flex rounded-full bg-[#F3F9FA] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#0B6470]">
                Extrato recente
              </span>
              <h2 className="mt-4 text-[28px] font-bold text-[#1F2A32]">Ultimas movimentacoes</h2>
              <p className="mt-2 text-sm text-[#72808A]">Filtro, paginacao e estados visuais seguem o mesmo padrao das outras telas da sprint.</p>
            </div>

            <div className="w-full xl:max-w-[360px]">
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Filtrar por descricao ou categoria"
                className="!mb-0 !border-[#D5E3E6] !py-3 text-sm"
                aria-label="Filtrar movimentacoes do extrato"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-5 lg:p-6">
            <LoadingState title="Carregando extrato da Home" description="Preparando as ultimas movimentacoes para consulta rapida." />
          </div>
        ) : error ? (
          <div className="p-5 lg:p-6">
            <ErrorState description={error} onRetry={() => void loadDashboardData()} />
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="p-5 lg:p-6">
            <EmptyState
              title="Nenhuma movimentacao encontrada"
              description="Tente outro termo de busca para localizar uma categoria ou despesa especifica."
            />
          </div>
        ) : (
          <>
            <div className="space-y-3 p-5 lg:p-6">
              {paginatedItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => showToast(`${item.label} selecionado para consulta rapida.`, "info")}
                  className="grid w-full grid-cols-[1fr_auto] gap-3 rounded-[18px] border border-[#E7EFF1] bg-[#FCFEFE] px-4 py-4 text-left transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-[#58AFAE]/15 sm:grid-cols-[1fr_auto_auto]"
                >
                  <div>
                    <p className={`text-[15px] font-bold ${item.value > 0 ? "text-[#32A95A]" : "text-[#1F2A32]"}`}>
                      {showMoneyValues ? formatCurrency(item.value) : hiddenValue}
                    </p>
                    <p className="mt-1 text-sm text-[#5B6770]">{item.label}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.08em] text-[#90A0A8]">{item.category}</p>
                  </div>

                  <div className="text-right text-sm text-[#6B7280]">
                    <div>{formatDate(item.date)}</div>
                    <div>{item.time}</div>
                  </div>

                  <span
                    className={`hidden self-center rounded-full px-4 py-2 text-xs font-semibold sm:inline-flex ${
                      item.value > 0 ? "bg-[#EAF9EF] text-[#32A95A]" : "bg-[#FFF1DB] text-[#F0A126]"
                    }`}
                  >
                    {item.value > 0 ? "Entrada" : "Saida"}
                  </span>
                </button>
              ))}
            </div>

            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalRecords={totalRecords}
              pageSize={pageSize}
              pageSizeOptions={[4, 6, 8]}
              disabled={isPending}
              onPageChange={goToPage}
              onPageSizeChange={changePageSize}
            />
          </>
        )}
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
      className="relative overflow-hidden rounded-[24px] p-5 text-white shadow-[0_14px_35px_rgba(0,0,0,0.12)]"
      style={{ background: gradient }}
    >
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full border border-white/25" />
      <div className="absolute -bottom-8 right-8 h-24 w-24 rounded-full bg-white/10" />
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/75">Conta digital</p>
          <h2 className="mt-5 text-[28px] font-semibold leading-none">{title}</h2>
          <p className="mt-2 text-sm text-white/80">{subtitle}</p>
        </div>
        <span className="material-symbols-outlined !text-[42px] opacity-60">{icon}</span>
      </div>

      <div className="relative z-10 mt-6 rounded-2xl bg-black/20 px-4 py-3 text-lg font-semibold tracking-[0.08em] backdrop-blur-sm">
        {value}
      </div>
    </article>
  );
}

function ActionCard({ action }: { action: QuickAction }) {
  const toneClasses = {
    amber: "border-[#F6E2BA] bg-[#FFF7E8] text-[#A56300]",
    blue: "border-[#D9E8FF] bg-[#EFF5FF] text-[#2D6FD2]",
    slate: "border-[#D9E2E6] bg-[#F5F8F9] text-[#31424C]",
  } as const;

  const buttonClasses = {
    amber: "bg-[#FFAA17] text-white",
    blue: "bg-[#4A8FF7] text-white",
    slate: "bg-[#1D2940] text-white",
  } as const;

  return (
    <div className={`flex items-center gap-4 rounded-[20px] border px-4 py-4 ${toneClasses[action.tone]}`}>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/70">
        <span className="material-symbols-outlined !text-[22px]">{action.icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-[#1F2A32]">{action.title}</p>
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

"use client"

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FinanceiroService } from "@/hooks/financeiro";
import { FinanceiroResumoDTO, FinanceiroTransacaoDTO } from "@/models/financeiro";
import InstituicaoDTO from "@/models/instituicao";
import OrcamentoDTO from "@/models/orcamento";
import UsuarioDTO from "@/models/usuario";

type ActionTone = "amber" | "blue" | "slate";

type QuickAction = {
  title: string;
  subtitle: string;
  button: string;
  tone: ActionTone;
  onClick: () => void;
  icon: string;
};

type ExpenseRow = {
  id: number;
  value: string;
  label: string;
  date: string;
  time: string;
  tone: "red" | "green";
  detail: string;
};

type CategoryLegend = {
  color: string;
  name: string;
  percentage: number;
  amount: number;
};

const DEFAULT_RESUMO: FinanceiroResumoDTO = {
  totalDespesas: 0,
  totalOrcamentos: 0,
  saldo: 0,
  balanca: 0,
  totalTransacoes: 0,
};

const HIDDEN_VALUE = "* * * * * *";

const categoryColors = ["#4B88F8", "#FF7E22", "#26BFB1", "#F4C61D"];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(value);

const toApiDate = (date: Date) => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getMonthBounds = (date: Date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return {
    start: toApiDate(start),
    end: toApiDate(end),
  };
};

const getMonthLabel = (date: Date) =>
  new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  })
    .format(date)
    .replace(/^./, (letter) => letter.toUpperCase());

const getDateAndTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return { date: "--/--/----", time: "--:--" };
  }

  return {
    date: new Intl.DateTimeFormat("pt-BR").format(date),
    time: new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date),
  };
};

const getDaysUntilNextMonth = () => {
  const now = new Date();
  const firstDayNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const diffMs = firstDayNextMonth.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
};

const getInstitutionName = (instituicoes: InstituicaoDTO[], instituicaoId?: number) => {
  if (!instituicaoId) return "Sem Instituição";
  return instituicoes.find((item) => item.id === instituicaoId)?.nome ?? `Instituição #${instituicaoId}`;
};

const getPendingRequestsCount = (orcamentos: OrcamentoDTO[]) => {
  const pending = orcamentos.filter((item) => item.situacao === 1).length;
  if (pending > 0) return pending;

  const pendingAlt = orcamentos.filter((item) => item.situacao === 0).length;
  if (pendingAlt > 0) return pendingAlt;

  return orcamentos.length;
};

const buildCategoryLegends = (
  transacoes: FinanceiroTransacaoDTO[],
  instituicoes: InstituicaoDTO[]
): CategoryLegend[] => {
  const byInstitution = new Map<string, number>();

  transacoes
    .filter((item) => item.tipo === "despesa")
    .forEach((item) => {
      const name = getInstitutionName(instituicoes, item.instituicaoId);
      const previous = byInstitution.get(name) ?? 0;
      byInstitution.set(name, previous + Math.abs(item.valor));
    });

  const total = Array.from(byInstitution.values()).reduce((acc, current) => acc + current, 0);

  if (total <= 0) {
    return [
      { color: categoryColors[0], name: "Sem dados", percentage: 100, amount: 0 },
      { color: categoryColors[1], name: "Sem dados", percentage: 0, amount: 0 },
      { color: categoryColors[2], name: "Sem dados", percentage: 0, amount: 0 },
      { color: categoryColors[3], name: "Outros", percentage: 0, amount: 0 },
    ];
  }

  const sorted = Array.from(byInstitution.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);

  const topThree = sorted.slice(0, 3).map((item, index) => ({
    color: categoryColors[index],
    name: item.name,
    amount: item.amount,
    percentage: Math.round((item.amount / total) * 100),
  }));

  const otherAmount = sorted.slice(3).reduce((acc, item) => acc + item.amount, 0);

  const legends = [
    ...topThree,
    {
      color: categoryColors[3],
      name: "Outros",
      amount: otherAmount,
      percentage: Math.max(0, 100 - topThree.reduce((acc, item) => acc + item.percentage, 0)),
    },
  ];

  while (legends.length < 4) {
    legends.splice(legends.length - 1, 0, {
      color: categoryColors[legends.length - 1],
      name: "Sem dados",
      amount: 0,
      percentage: 0,
    });
  }

  return legends;
};

export default function Dashboard() {
  const router = useRouter();
  const financeiroService = useMemo(() => new FinanceiroService(), []);

  const [showAvailable, setShowAvailable] = useState(true);
  const [showExpenses, setShowExpenses] = useState(true);
  const [monthIndex, setMonthIndex] = useState(0);
  const [showMoneyValues, setShowMoneyValues] = useState(false);

  const [resumo, setResumo] = useState<FinanceiroResumoDTO>(DEFAULT_RESUMO);
  const [transacoes, setTransacoes] = useState<FinanceiroTransacaoDTO[]>([]);
  const [instituicoes, setInstituicoes] = useState<InstituicaoDTO[]>([]);
  const [orcamentos, setOrcamentos] = useState<OrcamentoDTO[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioDTO[]>([]);

  const [isLoadingHome, setIsLoadingHome] = useState(true);
  const [homeError, setHomeError] = useState<string | null>(null);

  const monthOptions = useMemo(() => {
    const today = new Date();
    return [0, -1, -2].map((offset) => new Date(today.getFullYear(), today.getMonth() + offset, 1));
  }, []);

  useEffect(() => {
    const selectedMonth = monthOptions[monthIndex] ?? monthOptions[0];
    const { start, end } = getMonthBounds(selectedMonth);
    let active = true;

    const loadHome = async () => {
      try {
        setIsLoadingHome(true);
        setHomeError(null);

        const [resumoData, transacoesData, instituicoesData, orcamentosData, usuariosData] =
          await Promise.all([
            financeiroService.getResumo({ dataInicio: start, dataFim: end, pageSize: 200 }),
            financeiroService.listarTransacoes({ dataInicio: start, dataFim: end, pageSize: 200 }),
            financeiroService.getInstituicoes(),
            financeiroService.getOrcamentos(),
            financeiroService.getUsuarios(),
          ]);

        if (!active) return;

        setResumo(resumoData);
        setTransacoes(transacoesData);
        setInstituicoes(instituicoesData);
        setOrcamentos(orcamentosData);
        setUsuarios(usuariosData);
      } catch (error) {
        if (!active) return;

        console.error("Erro ao carregar dados da Home:", error);
        setHomeError("Não foi possível carregar os dados da Home.");
        setResumo(DEFAULT_RESUMO);
        setTransacoes([]);
      } finally {
        if (active) setIsLoadingHome(false);
      }
    };

    void loadHome();

    return () => {
      active = false;
    };
  }, [financeiroService, monthIndex, monthOptions]);

  const daysUntilRefill = useMemo(() => getDaysUntilNextMonth(), []);

  const currentUserName = useMemo(() => {
    const firstUser = usuarios[0]?.nome?.trim();
    return firstUser && firstUser.length > 0 ? firstUser : "Gestor";
  }, [usuarios]);

  const totalAvailable = resumo.totalOrcamentos;
  const totalExpenses = resumo.totalDespesas;
  const balanceValue = resumo.saldo;

  const categoryLegends = useMemo(
    () => buildCategoryLegends(transacoes, instituicoes),
    [transacoes, instituicoes]
  );

  const [healthCategory, secretariaCategory, reformasCategory, othersCategory] = categoryLegends;

  const topInstitution = useMemo(() => {
    const categoriesWithValue = categoryLegends.filter((item) => item.amount > 0);
    if (categoriesWithValue.length === 0) return null;
    return categoriesWithValue.sort((a, b) => b.amount - a.amount)[0] ?? null;
  }, [categoryLegends]);

  const pendingRequests = useMemo(() => getPendingRequestsCount(orcamentos), [orcamentos]);

  const quickActions = useMemo<QuickAction[]>(
    () => [
      {
        title: topInstitution
          ? `${topInstitution.name} (${topInstitution.percentage}%)`
          : "Sem concentração de gastos",
        subtitle: "Maior participação no mês selecionado",
        button: "Ver Detalhes",
        tone: "amber",
        onClick: () => router.push("/dashboard/instituicoes"),
        icon: "warning",
      },
      {
        title: `${pendingRequests} solicitações de verba`,
        subtitle: "Aguardando sua aprovação",
        button: "Revisar",
        tone: "blue",
        onClick: () => router.push("/dashboard/orcamentos"),
        icon: "check_circle",
      },
      {
        title: "Adicionar novo gasto",
        subtitle: "Ir para lançamentos de despesas",
        button: "Lançar",
        tone: "slate",
        onClick: () => router.push("/dashboard/despesas"),
        icon: "add",
      },
      {
        title: "Documentos",
        subtitle: "Módulo em evolução nesta sprint",
        button: "Abrir",
        tone: "slate",
        onClick: () => router.push("/dashboard/configuracoes"),
        icon: "description",
      },
    ],
    [pendingRequests, router, topInstitution]
  );

  const recentMovements = useMemo<ExpenseRow[]>(
    () =>
      transacoes.slice(0, 5).map((item) => {
        const value = Math.abs(item.valor);
        const prefix = item.tipo === "orcamento" ? "+" : "-";
        const tone = item.tipo === "orcamento" ? "green" : "red";
        const { date, time } = getDateAndTime(item.data);

        return {
          id: item.id,
          value: `${prefix} ${formatCurrency(value)}`,
          label: getInstitutionName(instituicoes, item.instituicaoId),
          date,
          time,
          tone,
          detail: item.descricao,
        };
      }),
    [instituicoes, transacoes]
  );

  const availableDisplay =
    homeError !== null
      ? "Sem dados"
      : showMoneyValues
      ? formatCurrency(totalAvailable)
      : HIDDEN_VALUE;

  const expenseDisplay =
    homeError !== null
      ? "Sem dados"
      : showMoneyValues
      ? formatCurrency(totalExpenses)
      : HIDDEN_VALUE;

  const balanceDisplay =
    homeError !== null
      ? "Sem dados"
      : showMoneyValues
      ? formatCurrency(balanceValue)
      : HIDDEN_VALUE;

  const forecastValue =
    homeError !== null
      ? "Sem dados"
      : showMoneyValues
      ? formatCurrency(totalExpenses)
      : HIDDEN_VALUE;

  const unbalancedInstitutionText =
    homeError !== null
      ? "Sem dados"
      : topInstitution && topInstitution.percentage >= 45
      ? `${topInstitution.name} (${topInstitution.percentage}%)`
      : "Nenhuma fora da média";

  const actionButtonClasses = {
    amber: "bg-[#FFAA17] text-white hover:brightness-95",
    blue: "bg-[#4A8FF7] text-white hover:brightness-95",
    slate: "bg-[#1D2940] text-white hover:brightness-95",
  } as const;

  const renderTopValue = (text: string) => {
    const masked = text === HIDDEN_VALUE;

    return (
      <div
        className={
          masked
            ? "text-6xl font-bold tracking-widest relative top-[25px]"
            : "text-[28px] sm:text-[32px] font-bold tracking-tight relative top-[12px]"
        }
      >
        {text}
      </div>
    );
  };

  const chartSeries = [
    {
      availableLine:
        "M30 245 C 82 236, 118 190, 156 138 C 186 98, 210 40, 246 44 C 282 48, 315 120, 352 180 C 382 226, 418 166, 454 132 C 498 92, 548 66, 604 78 C 656 88, 690 98, 716 104",
      expenseLine:
        "M30 196 C 92 184, 140 174, 182 160 C 220 148, 272 118, 322 110 C 362 104, 402 200, 438 206 C 478 212, 522 128, 574 120 C 626 112, 674 132, 716 146",
      availableMarker: { x: 219, y: 44, labelX: 135, labelY: -2, textX: 219, textY: 24 },
      expenseMarker: { x: 411, y: 206, labelX: 328, labelY: 220, textX: 412, textY: 246 },
    },
    {
      availableLine:
        "M30 236 C 84 226, 126 176, 162 122 C 190 82, 214 52, 250 58 C 292 66, 330 138, 360 184 C 390 226, 428 186, 460 144 C 498 98, 546 74, 604 86 C 654 96, 688 110, 716 118",
      expenseLine:
        "M30 210 C 92 194, 138 168, 182 144 C 226 122, 278 130, 318 174 C 350 208, 394 188, 430 156 C 474 116, 520 104, 576 114 C 628 122, 676 142, 716 156",
      availableMarker: { x: 250, y: 58, labelX: 166, labelY: 12, textX: 250, textY: 38 },
      expenseMarker: { x: 318, y: 174, labelX: 235, labelY: 188, textX: 319, textY: 214 },
    },
    {
      availableLine:
        "M30 252 C 88 238, 124 204, 158 156 C 188 114, 214 74, 250 70 C 286 66, 318 112, 350 154 C 382 196, 420 176, 460 140 C 504 102, 554 92, 610 110 C 658 126, 692 140, 716 150",
      expenseLine:
        "M30 214 C 86 200, 132 186, 176 164 C 220 142, 272 110, 314 118 C 356 126, 394 204, 430 214 C 470 224, 516 152, 570 140 C 626 128, 674 144, 716 160",
      availableMarker: { x: 250, y: 70, labelX: 166, labelY: 24, textX: 250, textY: 50 },
      expenseMarker: { x: 430, y: 214, labelX: 347, labelY: 228, textX: 431, textY: 254 },
    },
  ];

  const currentSeries = chartSeries[monthIndex] ?? chartSeries[0];

  const selectedMonthDate = monthOptions[monthIndex] ?? monthOptions[0];
  const monthLabel = getMonthLabel(selectedMonthDate);
  const markerAvailableText = `05/${`${selectedMonthDate.getMonth() + 1}`.padStart(2, "0")}/${selectedMonthDate.getFullYear()}`;
  const markerExpenseText = `18/${`${selectedMonthDate.getMonth() + 1}`.padStart(2, "0")}/${selectedMonthDate.getFullYear()}`;

  return (
    <div className="min-h-screen w-full bg-[#FCFCFB] font-sans">
      <div className="border-b w-full border-[#F0EEE9] bg-white/95 pb-10 pt-2">
        <div className="mx-auto flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
          <div className="flex-1">
            <h1 className="text-[40px] font-semibold leading-tight text-[#004C57] sm:text-[48px]">
              Bem-Vindo {currentUserName}
            </h1>
            <p className="mt-1 text-sm text-gray-600 sm:text-base">Vamos ao gerenciamento?</p>
            {homeError && <p className="mt-2 text-sm text-[#B45454]">{homeError}</p>}
          </div>
        </div>
      </div>

      <div className="w-full pb-14 pt-8">
        <div className="mx-auto w-full px-1">
          <p className="mb-6 pt-2 text-center text-[24px] font-bold text-[#1F1F1F]">
            {daysUntilRefill} dias até a reposição da verba.
          </p>

          <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <TopCard
              title="Valor Disponível"
              subtitle="Saldo atualizado"
              value={renderTopValue(availableDisplay)}
              gradient="linear-gradient(135deg,#0D7A7C 0%,#62B8B2 55%,#65C4D1 100%)"
              icon="account_balance"
              showMoneyValues={showMoneyValues}
              isLoading={isLoadingHome}
              onClick={() => setShowMoneyValues((prev) => !prev)}
            />

            <TopCard
              title="Balança"
              subtitle="Valor disponível - gastos totais"
              value={renderTopValue(balanceDisplay)}
              gradient="linear-gradient(135deg,#181818 0%,#4F4F4F 50%,#1F2126 100%)"
              icon="balance"
              showMoneyValues={showMoneyValues}
              dark
              isLoading={isLoadingHome}
              onClick={() => router.push("/dashboard/financeiro")}
            />

            <TopCard
              title="Gastos Totais"
              subtitle="No mês selecionado"
              value={renderTopValue(expenseDisplay)}
              gradient="linear-gradient(135deg,#FF961F 0%,#F4AA39 48%,#F8BF68 100%)"
              icon="monetization_on"
              showMoneyValues={showMoneyValues}
              accent
              isLoading={isLoadingHome}
              onClick={() => setShowMoneyValues((prev) => !prev)}
            />
          </div>

          <div className="mt-8 grid w-full grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-[28px] bg-[#FFFDFB] p-4 shadow-[0_10px_24px_rgba(0,0,0,0.06)] ring-1 ring-[#EFE8DE]">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex gap-1 text-[#C8C1B6]">
                  <span className="h-2 w-2 rounded-full bg-current" />
                  <span className="h-2 w-2 rounded-full bg-current" />
                  <span className="h-2 w-2 rounded-full bg-current" />
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/orcamentos")}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FFAA17] text-[11px] font-bold text-white"
                  aria-label="Solicitações pendentes"
                >
                  {isLoadingHome ? "..." : pendingRequests}
                </button>
              </div>
              <h3 className="text-[18px] font-semibold text-[#1E1E1E]">Ações Rápidas & Pendências</h3>
              <div className="mt-4 space-y-3">
                {quickActions.map((item, index) => (
                  <div
                    key={`${item.title}-${index}`}
                    className={`flex items-center gap-3 rounded-[18px] border px-4 py-4 ${
                      index === 0
                        ? "bg-[#FFF7E8] border-[#F6E2BA]"
                        : index === 1
                        ? "bg-[#EFF5FF] border-[#D9E8FF]"
                        : "bg-[#F8F8F8] border-[#ECECEC]"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full ${
                        index === 0 ? "text-[#F5A623]" : index === 1 ? "text-[#4A8FF7]" : "text-[#9C9C9C]"
                      }`}
                    >
                      <span className="material-symbols-outlined">{item.icon}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold text-[#1F1F1F]">{item.title}</p>
                      <p className="truncate text-[12px] text-[#A8A29A]">{item.subtitle}</p>
                    </div>
                    <button
                      type="button"
                      onClick={item.onClick}
                      className={`rounded-full px-5 py-2 text-[13px] font-bold transition ${
                        actionButtonClasses[item.tone]
                      }`}
                    >
                      {item.button}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] bg-[#FFFDFB] p-4 shadow-[0_10px_24px_rgba(0,0,0,0.06)] ring-1 ring-[#EFE8DE]">
              <h3 className="mt-2 text-center text-[18px] font-semibold text-[#222]">Gastos por Categoria</h3>

              <div className="mx-auto mt-4 flex max-w-[330px] items-center justify-center">
                <div className="relative h-[200px] w-[200px] sm:h-[230px] sm:w-[230px] md:h-[250px] md:w-[250px]">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(
                        #4B88F8 0 ${healthCategory.percentage}%,
                        #FF7E22 ${healthCategory.percentage}% ${healthCategory.percentage + secretariaCategory.percentage}%,
                        #26BFB1 ${healthCategory.percentage + secretariaCategory.percentage}% ${
                        healthCategory.percentage + secretariaCategory.percentage + reformasCategory.percentage
                      }%,
                        #F4C61D ${
                        healthCategory.percentage + secretariaCategory.percentage + reformasCategory.percentage
                      }% 100%
                      )`,
                    }}
                  />
                  <div className="absolute inset-[32px] rounded-full bg-[#FFFDFB]" />
                </div>
              </div>

              <div className="mt-1 grid grid-cols-2 gap-x-6 gap-y-2 px-4 pb-1 text-[13px] text-[#8E8E8E]">
                <Legend
                  color={healthCategory.color}
                  text={`${healthCategory.name} (${healthCategory.percentage}%)`}
                />
                <Legend
                  color={secretariaCategory.color}
                  text={`${secretariaCategory.name} (${secretariaCategory.percentage}%)`}
                />
                <Legend
                  color={reformasCategory.color}
                  text={`${reformasCategory.name} (${reformasCategory.percentage}%)`}
                />
                <Legend color={othersCategory.color} text={`${othersCategory.name} (${othersCategory.percentage}%)`} />
              </div>
            </section>
          </div>

          <div className="mt-8 grid w-full grid-cols-1 gap-6 xl:grid-cols-2">
            <InfoCard
              badge="PREVISÃO DO MÊS"
              title="Gastos previstos para esse mês"
              subtitle="Estimativa baseada nas transações e despesas do período selecionado."
              value={isLoadingHome ? "Carregando..." : forecastValue}
              icon="account_balance_wallet"
              onClick={() => router.push("/dashboard/financeiro")}
            />
            <InfoCard
              badge="ALERTA DE GASTOS"
              title="Instituições desbalanceadas"
              subtitle="Instituições gastando acima da concentração média do período."
              value={isLoadingHome ? "Carregando..." : unbalancedInstitutionText}
              icon="bar_chart"
              onClick={() => router.push("/dashboard/instituicoes")}
            />
          </div>

          <div className="mt-8 grid w-full grid-cols-1 gap-6 xl:grid-cols-2">
            <article className="relative overflow-hidden rounded-[30px] bg-[#FFFDFB] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.06)] ring-1 ring-[#ECE6DD]">
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#F7F4EF]" />
              <div className="relative z-10 flex gap-1 text-[#C9C2B7]">
                <span className="h-2 w-2 rounded-full bg-current" />
                <span className="h-2 w-2 rounded-full bg-current" />
                <span className="h-2 w-2 rounded-full bg-current" />
              </div>

              <div className="relative z-10 mt-1 text-center">
                <h3 className="text-[28px] font-extrabold leading-[1.05] text-[#212121] md:text-[36px]">
                  Gráfico
                  <br />
                  Financeiro
                </h3>
              </div>

              <div className="relative z-10 mt-2 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <span className="inline-flex w-fit rounded-full bg-[#FFF0DD] px-5 py-1.5 text-[13px] font-extrabold uppercase tracking-[0.02em] text-[#FF980E]">
                  VISÃO GERAL
                </span>
                <p className="max-w-[300px] text-right text-[16px] leading-[1.1] text-[#B0ACA5]">
                  Comparativo: Valor Disponível vs
                  <br />
                  Gastos
                </p>
              </div>

              <div className="relative z-10 mt-2 h-[220px] rounded-[16px] px-2 pb-8 pt-2 sm:h-[260px] lg:h-[300px]">
                <svg
                  viewBox="0 0 740 300"
                  className="h-full w-full"
                  preserveAspectRatio="none"
                  aria-label="Gráfico financeiro comparativo"
                >
                  <defs>
                    <linearGradient id="tealFillExact" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0A5F6B" stopOpacity={showAvailable ? 0.16 : 0.02} />
                      <stop offset="100%" stopColor="#0A5F6B" stopOpacity="0.02" />
                    </linearGradient>
                    <linearGradient id="redFillExact" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF5757" stopOpacity={showExpenses ? 0.1 : 0.02} />
                      <stop offset="100%" stopColor="#FF5757" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>

                  {showAvailable && (
                    <>
                      <path d={`${currentSeries.availableLine} L 716 286 L 30 286 Z`} fill="url(#tealFillExact)" />
                      <path
                        d={currentSeries.availableLine}
                        fill="none"
                        stroke="#075E69"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <line
                        x1={currentSeries.availableMarker.x}
                        y1={currentSeries.availableMarker.y}
                        x2={currentSeries.availableMarker.x}
                        y2="286"
                        stroke="#B7CCD1"
                        strokeWidth="2"
                        strokeDasharray="7 7"
                      />
                      <circle
                        cx={currentSeries.availableMarker.x}
                        cy={currentSeries.availableMarker.y}
                        r="7"
                        fill="#FFF"
                        stroke="#075E69"
                        strokeWidth="4"
                      />
                      <rect
                        x={currentSeries.availableMarker.labelX}
                        y={currentSeries.availableMarker.labelY}
                        rx="14"
                        ry="14"
                        width="168"
                        height="40"
                        fill="#075E69"
                      />
                      <text
                        x={currentSeries.availableMarker.textX}
                        y={currentSeries.availableMarker.textY}
                        textAnchor="middle"
                        fontSize="18"
                        fontWeight="700"
                        fill="#FFFFFF"
                      >
                        {markerAvailableText}
                      </text>
                    </>
                  )}

                  {showExpenses && (
                    <>
                      <path d={`${currentSeries.expenseLine} L 716 286 L 30 286 Z`} fill="url(#redFillExact)" />
                      <path
                        d={currentSeries.expenseLine}
                        fill="none"
                        stroke="#FF5555"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <line
                        x1={currentSeries.expenseMarker.x}
                        y1={currentSeries.expenseMarker.y}
                        x2={currentSeries.expenseMarker.x}
                        y2="286"
                        stroke="#F2B0B0"
                        strokeWidth="2"
                        strokeDasharray="7 7"
                      />
                      <circle
                        cx={currentSeries.expenseMarker.x}
                        cy={currentSeries.expenseMarker.y}
                        r="7"
                        fill="#FFF"
                        stroke="#FF5555"
                        strokeWidth="4"
                      />
                      <rect
                        x={currentSeries.expenseMarker.labelX}
                        y={currentSeries.expenseMarker.labelY}
                        rx="14"
                        ry="14"
                        width="168"
                        height="40"
                        fill="#FF5757"
                      />
                      <text
                        x={currentSeries.expenseMarker.textX}
                        y={currentSeries.expenseMarker.textY}
                        textAnchor="middle"
                        fontSize="18"
                        fontWeight="700"
                        fill="#FFFFFF"
                      >
                        {markerExpenseText}
                      </text>
                    </>
                  )}

                  <g fill="#B3B3B3" fontSize="13" fontWeight="500">
                    <text x="58" y="310">01/{`${selectedMonthDate.getMonth() + 1}`.padStart(2, "0")}</text>
                    <text x="164" y="310">05/{`${selectedMonthDate.getMonth() + 1}`.padStart(2, "0")}</text>
                    <text x="271" y="310">10/{`${selectedMonthDate.getMonth() + 1}`.padStart(2, "0")}</text>
                    <text x="363" y="310">15/{`${selectedMonthDate.getMonth() + 1}`.padStart(2, "0")}</text>
                    <text x="470" y="310">20/{`${selectedMonthDate.getMonth() + 1}`.padStart(2, "0")}</text>
                    <text x="578" y="310">25/{`${selectedMonthDate.getMonth() + 1}`.padStart(2, "0")}</text>
                    <text x="658" y="310">30/{`${selectedMonthDate.getMonth() + 1}`.padStart(2, "0")}</text>
                  </g>
                </svg>
              </div>

              <div className="relative z-10 mt-3 flex flex-col gap-3 lg:flex-row">
                <button
                  type="button"
                  onClick={() => setShowAvailable((v) => !v)}
                  className={`inline-flex min-h-[56px] w-full items-center justify-center gap-3 rounded-[18px] border px-4 py-3 text-[16px] font-bold shadow-sm transition hover:brightness-[0.98] lg:flex-1 ${
                    showAvailable
                      ? "border-[#B9D0D3] bg-[#EAF4F5] text-[#075E69]"
                      : "border-[#D8E2E3] bg-[#F5FAFA] text-[#8AA8AC]"
                  }`}
                >
                  <span className="relative h-4 w-8">
                    <span
                      className={`absolute left-0 top-1/2 h-[3px] w-full -translate-y-1/2 rounded-full ${
                        showAvailable ? "bg-[#075E69]" : "bg-[#8AA8AC]"
                      }`}
                    />
                    <span
                      className={`absolute left-[8px] top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-[3px] bg-white ${
                        showAvailable ? "border-[#075E69]" : "border-[#8AA8AC]"
                      }`}
                    />
                  </span>
                  Valor disponível
                </button>

                <button
                  type="button"
                  onClick={() => setShowExpenses((v) => !v)}
                  className={`inline-flex min-h-[56px] w-full items-center justify-center gap-3 rounded-[18px] border px-4 py-3 text-[16px] font-bold shadow-sm transition hover:brightness-[0.98] lg:flex-1 ${
                    showExpenses
                      ? "border-[#F2B7B7] bg-[#FFF3F3] text-[#FF5555]"
                      : "border-[#E7D4D4] bg-[#FFF9F9] text-[#D59A9A]"
                  }`}
                >
                  <span className="relative h-4 w-8">
                    <span
                      className={`absolute left-0 top-1/2 h-[3px] w-full -translate-y-1/2 rounded-full ${
                        showExpenses ? "bg-[#FF5555]" : "bg-[#D59A9A]"
                      }`}
                    />
                    <span
                      className={`absolute left-[8px] top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-[3px] bg-white ${
                        showExpenses ? "border-[#FF5555]" : "border-[#D59A9A]"
                      }`}
                    />
                  </span>
                  Gastos totais
                </button>

                <button
                  type="button"
                  onClick={() => setMonthIndex((prev) => (prev + 1) % monthOptions.length)}
                  className="inline-flex min-h-[56px] w-full items-center justify-center gap-3 rounded-[18px] border border-[#F0CFA4] bg-[#FFF6E8] px-4 py-3 text-[16px] font-bold text-[#F0A126] shadow-sm transition hover:brightness-[0.98] lg:flex-1"
                >
                  <span className="material-symbols-outlined !text-[18px]">calendar_month</span>
                  {monthLabel}
                </button>
              </div>
            </article>

            <article className="relative overflow-hidden rounded-[30px] bg-[#FFFDFB] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.06)] ring-1 ring-[#ECE6DD]">
              <div className="absolute -right-10 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF0DD] text-[#F0A126]">
                <span className="material-symbols-outlined">receipt_long</span>
              </div>
              <span className="inline-flex rounded-full bg-[#FFF0DD] px-4 py-1 text-[11px] font-bold uppercase tracking-[0.05em] text-[#F0A126]">
                EXTRATO RECENTE
              </span>
              <h3 className="mt-4 text-center text-[28px] font-bold text-[#232323]">Últimos Lançamentos:</h3>
              <p className="mt-1 text-center text-[13px] text-[#B0ACA5]">
                Aqui você pode ver onde está indo os fundos.
              </p>
              <div className="mt-6 space-y-3">
                {isLoadingHome &&
                  Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={`skeleton-${index}`}
                      className="h-[74px] animate-pulse rounded-[16px] border border-[#F0ECE5] bg-[#F7F4EF]"
                    />
                  ))}

                {!isLoadingHome && recentMovements.length === 0 && (
                  <div className="rounded-[16px] border border-[#F0ECE5] bg-white px-3 py-6 text-center text-[13px] text-[#8E8E8E]">
                    Sem dados para o período selecionado.
                  </div>
                )}

                {!isLoadingHome &&
                  recentMovements.map((item) => (
                    <div
                      key={`${item.id}-${item.date}-${item.time}`}
                      className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-[16px] border border-[#F0ECE5] bg-white px-3 py-3 sm:grid-cols-[1fr_auto_auto]"
                    >
                      <div>
                        <p className={`text-[15px] font-bold ${item.tone === "green" ? "text-[#35B86B]" : "text-[#3B3B3B]"}`}>
                          {showMoneyValues ? item.value : HIDDEN_VALUE}
                        </p>
                        <p className="text-[12px] text-[#A9A29A]">{item.label}</p>
                      </div>
                      <div className="text-right text-[12px] text-[#8E8E8E]">
                        <div>{item.date}</div>
                        <div>{item.time}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => window.alert(item.detail)}
                        className={`hidden sm:inline-flex rounded-full px-4 py-2 text-[12px] font-bold ${
                          item.tone === "green" ? "bg-[#EAF9EF] text-[#35B86B]" : "bg-[#FFF1DB] text-[#F0A126]"
                        }`}
                      >
                        Ver mais +
                      </button>
                    </div>
                  ))}
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopCard({
  title,
  subtitle,
  value,
  gradient,
  icon,
  onClick,
  showMoneyValues = false,
  isLoading = false,
  dark = false,
  accent = false,
}: {
  title: string;
  subtitle: string;
  value: React.ReactNode;
  gradient: string;
  icon: string;
  onClick: () => void;
  showMoneyValues?: boolean;
  isLoading?: boolean;
  dark?: boolean;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative h-[164px] w-full overflow-hidden rounded-[20px] p-4 text-left shadow-[0_10px_24px_rgba(0,0,0,0.07)] transition hover:-translate-y-0.5"
      style={{ background: gradient }}
    >
      <div className={`absolute right-4 top-4 opacity-70 ${dark ? "text-white/60" : "text-white/55"}`}>
        <span className="material-symbols-outlined !text-[42px]">{icon}</span>
      </div>

      <div className={`text-[14px] font-semibold ${dark ? "text-white" : accent ? "text-[#5E3000]" : "text-white"}`}>
        Conta Digital
      </div>

      <div className={`mt-2 text-[26px] font-bold leading-tight ${dark ? "text-white" : accent ? "text-[#5E3000]" : "text-white"}`}>
        {title}
      </div>

      <div className={`mt-1 h-[18px] text-[12px] ${dark ? "text-white/70" : accent ? "text-[#7A4C15]" : "text-white/80"}`}>
        {subtitle}
      </div>

      <div className={`${dark ? "text-white" : accent ? "text-[#5E3000]" : "text-white"}`}>
        {isLoading ? <div className="mt-4 h-9 w-2/3 animate-pulse rounded-full bg-white/30" /> : value}
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-end bg-black/12 px-4 py-2">
        <span className="material-symbols-outlined !text-[22px] text-white">
          {showMoneyValues ? "visibility" : "visibility_off"}
        </span>
      </div>
    </button>
  );
}

function Legend({ color, text }: { color: string; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span>{text}</span>
    </div>
  );
}

function InfoCard({
  badge,
  title,
  subtitle,
  value,
  icon,
  onClick,
}: {
  badge: string;
  title: string;
  subtitle: string;
  value: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <article className="relative overflow-hidden rounded-[28px] bg-[#FFFDFB] p-5 shadow-[0_10px_24px_rgba(0,0,0,0.06)] ring-1 ring-[#EFE8DE]">
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#F8F4EC]" />
      <div className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF1DB] text-[#F0A126]">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className="flex gap-1 text-[#C9C2B7]">
        <span className="h-2 w-2 rounded-full bg-current" />
        <span className="h-2 w-2 rounded-full bg-current" />
        <span className="h-2 w-2 rounded-full bg-current" />
      </div>
      <span className="mt-4 inline-flex rounded-full bg-[#FFF0DD] px-4 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-[#F0A126]">
        {badge}
      </span>
      <h3 className="mt-5 text-[24px] font-bold leading-tight text-[#232323]">{title}</h3>
      <p className="mt-2 text-[13px] text-[#B0ACA5]">{subtitle}</p>
      <button
        type="button"
        onClick={onClick}
        className="mt-8 flex w-full items-center justify-center rounded-[16px] bg-[#F3E7D5] px-4 py-4 text-[15px] font-semibold text-[#6E604E] transition hover:brightness-[0.98]"
      >
        {value}
      </button>
    </article>
  );
}

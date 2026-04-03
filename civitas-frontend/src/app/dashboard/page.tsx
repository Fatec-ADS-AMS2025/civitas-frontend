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

type ChartMarker = {
  x: number;
  y: number;
  labelX: number;
  labelY: number;
  textX: number;
  textY: number;
  text: string;
};

type ChartPoint = {
  x: number;
  y: number;
  value: number;
  day: number;
};

type ChartTick = {
  y: number;
  value: number;
  label: string;
};

type ChartData = {
  availableLine: string;
  availableArea: string;
  expenseLine: string;
  expenseArea: string;
  availableMarker: ChartMarker;
  expenseMarker: ChartMarker;
  xTicks: Array<{ x: number; label: string }>;
  yTicks: ChartTick[];
  zeroY: number;
  availablePoints: ChartPoint[];
  expensePoints: ChartPoint[];
  availableSeries: number[];
  expenseSeries: number[];
  daysInMonth: number;
  month: number;
  year: number;
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
const CHART_VIEWBOX_WIDTH = 740;
const CHART_VIEWBOX_HEIGHT = 300;
const CHART_LEFT = 72;
const CHART_RIGHT = 716;
const CHART_BOTTOM = 278;
const CHART_TOP = 38;
const CHART_TOP_PADDING = 26;
const CHART_BOTTOM_PADDING = 22;
const MARKER_LABEL_WIDTH = 168;
const MARKER_LABEL_HEIGHT = 40;
const Y_TICK_COUNT = 6;
const TOOLTIP_WIDTH = 186;
const TOOLTIP_HEIGHT = 94;
const TOOLTIP_GAP = 10;
const TOOLTIP_EDGE = 8;
const MARKER_COLLISION_GAP = 8;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(value);

const formatAxisCurrency = (value: number) => {
  const signal = value < 0 ? "-" : "";
  const abs = Math.abs(value);

  if (abs < 1000) {
    return `${signal}R$ ${Math.round(abs).toLocaleString("pt-BR")}`;
  }

  if (abs < 1_000_000) {
    const mil = abs / 1000;
    const formatted = mil >= 100 ? Math.round(mil).toString() : mil.toFixed(1).replace(".", ",");
    return `${signal}R$ ${formatted} mil`;
  }

  const mi = abs / 1_000_000;
  const formatted = mi >= 100 ? Math.round(mi).toString() : mi.toFixed(1).replace(".", ",");
  return `${signal}R$ ${formatted} mi`;
};

const niceStep = (minValue: number, maxValue: number, tickCount: number) => {
  const rawStep = Math.abs(maxValue - minValue) / Math.max(1, tickCount - 1);
  if (rawStep <= 0 || Number.isNaN(rawStep)) return 1;

  const power = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const normalized = rawStep / power;

  if (normalized <= 1) return power;
  if (normalized <= 2) return 2 * power;
  if (normalized <= 5) return 5 * power;
  return 10 * power;
};

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

const buildPath = (points: Array<{ x: number; y: number }>): string => {
  if (points.length === 0) {
    return `M${CHART_LEFT} ${CHART_BOTTOM}`;
  }

  const first = points[0];
  const segments = points.slice(1).map((point) => `L ${point.x} ${point.y}`);
  return [`M${first.x} ${first.y}`, ...segments].join(" ");
};

const buildSmoothPath = (points: Array<{ x: number; y: number }>): string => {
  if (points.length < 3) {
    return buildPath(points);
  }

  const path: string[] = [`M${points[0].x} ${points[0].y}`];

  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[Math.max(0, index - 1)];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[Math.min(points.length - 1, index + 2)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`);
  }

  return path.join(" ");
};

const buildAreaPath = (linePath: string, points: Array<{ x: number; y: number }>, baselineY: number) => {
  if (points.length === 0) {
    return `M${CHART_LEFT} ${baselineY} L ${CHART_RIGHT} ${baselineY} Z`;
  }

  return `${linePath} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`;
};

const buildSeries = (
  transacoes: FinanceiroTransacaoDTO[],
  year: number,
  month: number,
  daysInMonth: number,
  totalAvailable: number
) => {
  const expensesByDay = Array.from({ length: daysInMonth }, () => 0);

  transacoes.forEach((item) => {
    if (item.tipo !== "despesa") return;

    const itemDate = new Date(item.data);
    if (Number.isNaN(itemDate.getTime())) return;
    if (itemDate.getFullYear() !== year || itemDate.getMonth() !== month) return;

    const index = itemDate.getDate() - 1;
    expensesByDay[index] += Number(item.valor) || 0;
  });

  const cumulativeExpenses: number[] = [];
  const budgetSeries: number[] = [];

  let spentSoFar = 0;
  for (let day = 0; day < daysInMonth; day += 1) {
    spentSoFar += expensesByDay[day];
    cumulativeExpenses.push(spentSoFar);
    budgetSeries.push(totalAvailable);
  }

  return { cumulativeExpenses, budgetSeries };
};

const calculateScale = (
  values: number[],
  usableTop: number,
  usableBottom: number,
  tickCount = Y_TICK_COUNT
) => {
  const safeValues = values.filter((value) => Number.isFinite(value));
  const baseValues = safeValues.length > 0 ? safeValues : [0, 1];

  let minValue = Math.min(...baseValues);
  let maxValue = Math.max(...baseValues);

  if (minValue > 0) minValue = 0;
  if (maxValue < 0) maxValue = 0;

  const initialRange = maxValue - minValue;
  if (initialRange === 0) {
    const fallback = Math.max(1, Math.abs(maxValue) || 1);
    minValue -= fallback / 2;
    maxValue += fallback / 2;
  }

  const paddedRange = maxValue - minValue;
  const padding = paddedRange * 0.1;
  minValue -= padding;
  maxValue += padding;

  const nonZeroAbs = baseValues
    .map((value) => Math.abs(value))
    .filter((value) => value > 0)
    .sort((a, b) => a - b);

  const minAbs = nonZeroAbs[0] ?? 1;
  const maxAbs = Math.max(Math.abs(minValue), Math.abs(maxValue));
  const useLogScale = maxAbs / Math.max(1, minAbs) > 1000;

  const toDomain = (value: number) => {
    if (!useLogScale) return value;
    return Math.sign(value) * Math.log10(Math.abs(value) + 1);
  };

  const fromDomain = (value: number) => {
    if (!useLogScale) return value;
    return Math.sign(value) * (Math.pow(10, Math.abs(value)) - 1);
  };

  let domainMin = toDomain(minValue);
  let domainMax = toDomain(maxValue);
  if (domainMin === domainMax) {
    domainMin -= 1;
    domainMax += 1;
  }

  const height = usableBottom - usableTop;
  const getY = (value: number) => {
    const normalized = (toDomain(value) - domainMin) / (domainMax - domainMin);
    return Number((usableBottom - normalized * height).toFixed(2));
  };

  const tickStep = niceStep(minValue, maxValue, tickCount);
  const tickStart = Math.ceil(minValue / tickStep) * tickStep;
  const yTicks: ChartTick[] = [];

  for (let value = tickStart; value <= maxValue + tickStep / 2; value += tickStep) {
    yTicks.push({
      y: getY(value),
      value,
      label: formatAxisCurrency(value),
    });
  }

  if (yTicks.length < 4) {
    const fallbackTicks = Array.from({ length: tickCount }, (_, index) => {
      const progress = tickCount <= 1 ? 0 : index / (tickCount - 1);
      const domainValue = domainMin + progress * (domainMax - domainMin);
      const tickValue = fromDomain(domainValue);
      return {
        y: Number((usableBottom - progress * height).toFixed(2)),
        value: tickValue,
        label: formatAxisCurrency(tickValue),
      };
    });

    return {
      minValue,
      maxValue,
      getY,
      yTicks: fallbackTicks,
      zeroY: getY(0),
    };
  }

  return {
    minValue,
    maxValue,
    getY,
    yTicks,
    zeroY: getY(0),
  };
};

const buildPaths = (points: ChartPoint[], baselineY: number) => {
  const line = buildSmoothPath(points);
  const area = buildAreaPath(line, points, baselineY);

  return { line, area };
};

const toChartData = (
  transacoes: FinanceiroTransacaoDTO[],
  selectedMonthDate: Date,
  totalAvailable: number
): ChartData => {
  const year = selectedMonthDate.getFullYear();
  const month = selectedMonthDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const { cumulativeExpenses, budgetSeries } = buildSeries(
    transacoes,
    year,
    month,
    daysInMonth,
    totalAvailable
  );

  const width = CHART_RIGHT - CHART_LEFT;
  const usableTop = CHART_TOP + CHART_TOP_PADDING;
  const usableBottom = CHART_BOTTOM - CHART_BOTTOM_PADDING;

  const scale = calculateScale(
    [...cumulativeExpenses, ...budgetSeries, totalAvailable],
    usableTop,
    usableBottom
  );

  const pointsFromSeries = (series: number[]) =>
    series.map((value, index) => {
      const x = daysInMonth <= 1 ? CHART_LEFT : CHART_LEFT + (index / (daysInMonth - 1)) * width;
      const y = scale.getY(value);
      return { x: Number(x.toFixed(2)), y, value, day: index + 1 };
    });

  const availablePoints = pointsFromSeries(budgetSeries);
  const expensePoints = pointsFromSeries(cumulativeExpenses);

  const buildMarker = (points: ChartPoint[]) => {
    const index = Math.max(0, points.length - 1);
    const point = points[index] ?? { x: CHART_LEFT, y: CHART_BOTTOM, value: 0, day: 1 };
    const day = String(index + 1).padStart(2, "0");
    const monthLabel = String(month + 1).padStart(2, "0");
    const text = `${day}/${monthLabel} • ${formatAxisCurrency(point.value)}`;

    const labelX = Math.max(
      CHART_LEFT,
      Math.min(CHART_RIGHT - MARKER_LABEL_WIDTH, point.x - MARKER_LABEL_WIDTH / 2)
    );
    const labelY = Math.max(0, point.y - (MARKER_LABEL_HEIGHT + 8));
    const labelCenter = labelX + MARKER_LABEL_WIDTH / 2;

    return {
      x: point.x,
      y: point.y,
      labelX,
      labelY,
      textX: labelCenter,
      textY: labelY + 26,
      text,
    };
  };

  const dayTicks = [1, 5, 10, 15, 20, 25, daysInMonth]
    .filter((day, index, arr) => day >= 1 && day <= daysInMonth && arr.indexOf(day) === index)
    .sort((a, b) => a - b);

  const xTicks = dayTicks.map((day) => {
    const x = daysInMonth <= 1 ? CHART_LEFT : CHART_LEFT + ((day - 1) / (daysInMonth - 1)) * width;
    const monthLabel = String(month + 1).padStart(2, "0");
    return { x: Number(x.toFixed(0)), label: `${String(day).padStart(2, "0")}/${monthLabel}` };
  });

  const availableLine = buildPath(availablePoints);
  const availableArea = buildAreaPath(availableLine, availablePoints, scale.zeroY);
  const expensePaths = buildPaths(expensePoints, scale.zeroY);

  return {
    availableLine,
    availableArea,
    expenseLine: expensePaths.line,
    expenseArea: expensePaths.area,
    availableMarker: buildMarker(availablePoints),
    expenseMarker: buildMarker(expensePoints),
    xTicks,
    yTicks: scale.yTicks,
    zeroY: scale.zeroY,
    availablePoints,
    expensePoints,
    availableSeries: budgetSeries,
    expenseSeries: cumulativeExpenses,
    daysInMonth,
    month,
    year,
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
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);
  const [hoveredCursor, setHoveredCursor] = useState<{ x: number; y: number } | null>(null);

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

  const selectedMonthDate = monthOptions[monthIndex] ?? monthOptions[0];

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

  const selectedYear = selectedMonthDate.getFullYear();

  const totalAvailable = useMemo(() => {
    const annualBudget = orcamentos
      .filter((item) => (item.anoOrcamento ?? item.ano) === selectedYear)
      .reduce((acc, item) => acc + Number(item.valorOrcamento ?? item.valor ?? 0), 0);

    return annualBudget > 0 ? annualBudget : resumo.totalOrcamentos;
  }, [orcamentos, resumo.totalOrcamentos, selectedYear]);

  const totalExpenses = resumo.totalDespesas;
  const balanceValue = totalAvailable - totalExpenses;

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
    return (
      <div className="text-[22px] font-bold leading-none tracking-tight tabular-nums sm:text-[24px]">
        {text}
      </div>
    );
  };

  const monthLabel = getMonthLabel(selectedMonthDate);
  const chartData = useMemo(
    () => toChartData(transacoes, selectedMonthDate, totalAvailable),
    [selectedMonthDate, totalAvailable, transacoes]
  );

  const markerVisuals = useMemo(() => {
    const available = {
      ...chartData.availableMarker,
      pointX: chartData.availableMarker.x,
      pointY: chartData.availableMarker.y,
    };
    const expense = {
      ...chartData.expenseMarker,
      pointX: chartData.expenseMarker.x,
      pointY: chartData.expenseMarker.y,
    };

    const closeX = Math.abs(available.pointX - expense.pointX) < 14;
    const closeY = Math.abs(available.pointY - expense.pointY) < 14;

    if (closeX && closeY) {
      available.pointX -= 4;
      expense.pointX += 4;
      available.labelY = Math.max(6, available.labelY - 22);
      expense.labelY = Math.min(CHART_BOTTOM - MARKER_LABEL_HEIGHT - 6, expense.labelY + 22);
    } else if (closeY) {
      available.pointY = Math.max(CHART_TOP + 4, available.pointY - 4);
      expense.pointY = Math.min(CHART_BOTTOM - 4, expense.pointY + 4);
    }

    available.labelY = Math.max(6, available.labelY);
    expense.labelY = Math.max(6, expense.labelY);

    return { available, expense };
  }, [chartData.availableMarker, chartData.expenseMarker]);

  useEffect(() => {
    setHoveredDayIndex(null);
    setHoveredCursor(null);
  }, [monthIndex]);

  const handleChartMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (chartData.daysInMonth <= 1) {
      setHoveredDayIndex(0);
      setHoveredCursor({ x: CHART_LEFT, y: CHART_TOP });
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const xInViewBox = ((event.clientX - rect.left) / rect.width) * CHART_VIEWBOX_WIDTH;
    const yInViewBox = ((event.clientY - rect.top) / rect.height) * CHART_VIEWBOX_HEIGHT;
    const clampedX = Math.max(CHART_LEFT, Math.min(CHART_RIGHT, xInViewBox));
    const clampedY = Math.max(CHART_TOP, Math.min(CHART_BOTTOM, yInViewBox));
    const ratio = (clampedX - CHART_LEFT) / (CHART_RIGHT - CHART_LEFT);
    const nearest = Math.round(ratio * (chartData.daysInMonth - 1));
    setHoveredDayIndex(Math.max(0, Math.min(chartData.daysInMonth - 1, nearest)));
    setHoveredCursor({ x: clampedX, y: clampedY });
  };

  const hoveredTooltip = useMemo(() => {
    if (hoveredDayIndex === null || hoveredCursor === null) return null;

    const day = hoveredDayIndex + 1;
    const dayLabel = String(day).padStart(2, "0");
    const month = String(chartData.month + 1).padStart(2, "0");

    const availableValue = chartData.availableSeries[hoveredDayIndex] ?? 0;
    const expenseValue = chartData.expenseSeries[hoveredDayIndex] ?? 0;
    const diffValue = availableValue - expenseValue;

    const anchorX = hoveredCursor.x;
    const clampX = (value: number) =>
      Math.max(CHART_LEFT + TOOLTIP_EDGE, Math.min(CHART_VIEWBOX_WIDTH - TOOLTIP_WIDTH - TOOLTIP_EDGE, value));
    const clampY = (value: number) =>
      Math.max(TOOLTIP_EDGE, Math.min(CHART_VIEWBOX_HEIGHT - TOOLTIP_HEIGHT - TOOLTIP_EDGE, value));

    const tooltipX = clampX(hoveredCursor.x + 14);
    const tooltipY = clampY(hoveredCursor.y - TOOLTIP_HEIGHT - 10);

    return {
      x: tooltipX,
      y: tooltipY,
      lineX: anchorX,
      dateLabel: `${dayLabel}/${month}/${chartData.year}`,
      availableText: formatCurrency(availableValue),
      expenseText: formatCurrency(expenseValue),
      diffText: formatCurrency(diffValue),
    };
  }, [chartData, hoveredCursor, hoveredDayIndex]);

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
                    className={`flex items-center gap-3 rounded-[18px] border px-4 py-4 ${index === 0
                        ? "bg-[#FFF7E8] border-[#F6E2BA]"
                        : index === 1
                          ? "bg-[#EFF5FF] border-[#D9E8FF]"
                          : "bg-[#F8F8F8] border-[#ECECEC]"
                      }`}
                  >
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full ${index === 0 ? "text-[#F5A623]" : index === 1 ? "text-[#4A8FF7]" : "text-[#9C9C9C]"
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
                      className={`rounded-full px-5 py-2 text-[13px] font-bold transition ${actionButtonClasses[item.tone]
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
                        #26BFB1 ${healthCategory.percentage + secretariaCategory.percentage}% ${healthCategory.percentage + secretariaCategory.percentage + reformasCategory.percentage
                        }%,
                        #F4C61D ${healthCategory.percentage + secretariaCategory.percentage + reformasCategory.percentage
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
            <article className="relative overflow-hidden rounded-[30px] bg-[radial-gradient(circle_at_15%_15%,#ffffff_0%,#FFFDFB_48%,#F7F8FA_100%)] p-5 shadow-[0_14px_34px_rgba(9,25,34,0.10)] ring-1 ring-[#EAE3D8]">
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#F4F1EA]" />
              <div className="absolute -left-10 bottom-14 h-24 w-24 rounded-full bg-[#EEF8F9]" />
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
                  viewBox={`0 0 ${CHART_VIEWBOX_WIDTH} ${CHART_VIEWBOX_HEIGHT}`}
                  className="h-full w-full"
                  preserveAspectRatio="none"
                  aria-label="Gráfico financeiro comparativo"
                  onMouseMove={handleChartMouseMove}
                  onMouseLeave={() => {
                    setHoveredDayIndex(null);
                    setHoveredCursor(null);
                  }}
                >
                  <defs>
                    <linearGradient id="tealFillExact" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0A6B78" stopOpacity={showAvailable ? 0.1 : 0.01} />
                      <stop offset="100%" stopColor="#0A6B78" stopOpacity="0.015" />
                    </linearGradient>
                    <linearGradient id="redFillExact" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EE5151" stopOpacity={showExpenses ? 0.12 : 0.02} />
                      <stop offset="100%" stopColor="#EE5151" stopOpacity="0.02" />
                    </linearGradient>
                    <filter id="tealGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="1.6" floodColor="#6A9298" floodOpacity="0.16" />
                    </filter>
                    <filter id="redGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#EE5151" floodOpacity="0.2" />
                    </filter>
                    <filter id="labelShadow" x="-30%" y="-30%" width="160%" height="160%">
                      <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#1B2A38" floodOpacity="0.18" />
                    </filter>
                    <filter id="tooltipShadow" x="-30%" y="-30%" width="160%" height="160%">
                      <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#101820" floodOpacity="0.16" />
                    </filter>
                  </defs>

                  <g stroke="#D9E2E8" strokeWidth="0.8" opacity="0.35">
                    {chartData.yTicks.map((tick, index) => (
                      <line
                        key={`grid-${index}-${tick.y}`}
                        x1={CHART_LEFT}
                        y1={tick.y}
                        x2={CHART_RIGHT}
                        y2={tick.y}
                      />
                    ))}
                  </g>

                  <g fill="#7A8590" fontSize="10" fontWeight="500" opacity="0.82" textAnchor="end">
                    {chartData.yTicks.map((tick, index) => (
                      <text key={`label-${index}-${tick.y}`} x={CHART_LEFT - 18} y={tick.y + 3}>
                        {tick.label}
                      </text>
                    ))}
                  </g>

                  <line
                    x1={CHART_LEFT}
                    y1={chartData.zeroY}
                    x2={CHART_RIGHT}
                    y2={chartData.zeroY}
                    stroke="#AAB7C2"
                    strokeWidth="1.2"
                    strokeDasharray="5 5"
                    opacity="0.6"
                  />

                  {showAvailable && <path d={chartData.availableArea} fill="url(#tealFillExact)" />}

                  {showExpenses && (
                    <>
                      <path d={chartData.expenseArea} fill="url(#redFillExact)" />
                      <path
                        d={chartData.expenseLine}
                        fill="none"
                        stroke="#EE5151"
                        strokeWidth="4.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#redGlow)"
                      />
                      <line
                        x1={markerVisuals.expense.pointX}
                        y1={markerVisuals.expense.pointY}
                        x2={markerVisuals.expense.pointX}
                        y2={CHART_BOTTOM}
                        stroke="#EFC3C3"
                        strokeWidth="1"
                        strokeDasharray="7 7"
                        opacity="0.45"
                      />
                      <circle
                        cx={markerVisuals.expense.pointX}
                        cy={markerVisuals.expense.pointY}
                        r="4"
                        fill="#EE5151"
                        stroke="#FFF1F1"
                        strokeWidth="1.6"
                      />
                    </>
                  )}

                  {showAvailable && (
                    <>
                      <>
                        {/* CONTORNO */}
                        <path
                          d={chartData.availableLine}
                          fill="none"
                          stroke="#0A6B78"
                          strokeWidth="5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity="0.9"
                        />

                        {/* LINHA PRINCIPAL */}
                        <path
                          d={chartData.availableLine}
                          fill="none"
                          stroke="#0A6B78"
                          strokeWidth="4.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          filter="url(#tealGlow)"
                        />
                      </>
                      <line
                        x1={markerVisuals.available.pointX}
                        y1={markerVisuals.available.pointY}
                        x2={markerVisuals.available.pointX}
                        y2={CHART_BOTTOM}
                        stroke="#BDD2D7"
                        strokeWidth="1"
                        strokeDasharray="6 6"
                        opacity="0.45"
                      />
                      <circle
                        cx={markerVisuals.available.pointX}
                        cy={markerVisuals.available.pointY}
                        r="4.4"
                        fill="#0A6B78"
                        stroke="#EEF6F7"
                        strokeWidth="1.8"
                      />
                    </>
                  )}

                  {hoveredTooltip && (
                    <g>
                      <line
                        x1={hoveredTooltip.lineX}
                        y1={CHART_TOP}
                        x2={hoveredTooltip.lineX}
                        y2={CHART_BOTTOM}
                        stroke="#8DA2B4"
                        strokeWidth="1"
                        strokeDasharray="5 5"
                        opacity="0.45"
                      />
                      <rect
                        x={hoveredTooltip.x}
                        y={hoveredTooltip.y}
                        width={TOOLTIP_WIDTH}
                        height={TOOLTIP_HEIGHT}
                        rx="10"
                        fill="#182734"
                        opacity="0.95"
                        filter="url(#tooltipShadow)"
                      />

                      <text x={hoveredTooltip.x + 12} y={hoveredTooltip.y + 16} fontSize="10" fill="#AFC2CF">
                        {hoveredTooltip.dateLabel}
                      </text>

                      <circle cx={hoveredTooltip.x + 15} cy={hoveredTooltip.y + 34} r="3.2" fill="#EE5151" />
                      <text x={hoveredTooltip.x + 24} y={hoveredTooltip.y + 37} fontSize="10" fill="#D4E1EA">
                        Gastos
                      </text>
                      <text
                        x={hoveredTooltip.x + TOOLTIP_WIDTH - 12}
                        y={hoveredTooltip.y + 37}
                        fontSize="11"
                        fontWeight="700"
                        fill="#FFEAEA"
                        textAnchor="end"
                      >
                        {hoveredTooltip.expenseText}
                      </text>

                      <circle cx={hoveredTooltip.x + 15} cy={hoveredTooltip.y + 54} r="3.2" fill="#6A9298" />
                      <text x={hoveredTooltip.x + 24} y={hoveredTooltip.y + 57} fontSize="10" fill="#D4E1EA">
                        Disponível
                      </text>
                      <text
                        x={hoveredTooltip.x + TOOLTIP_WIDTH - 12}
                        y={hoveredTooltip.y + 57}
                        fontSize="11"
                        fontWeight="700"
                        fill="#EAF9FB"
                        textAnchor="end"
                      >
                        {hoveredTooltip.availableText}
                      </text>

                      <line
                        x1={hoveredTooltip.x + 12}
                        y1={hoveredTooltip.y + 66}
                        x2={hoveredTooltip.x + TOOLTIP_WIDTH - 12}
                        y2={hoveredTooltip.y + 66}
                        stroke="#304556"
                        strokeWidth="1"
                      />
                      <text
                        x={hoveredTooltip.x + 12}
                        y={hoveredTooltip.y + 81}
                        fontSize="10"
                        fill="#AFC2CF"
                      >
                        Diferença
                      </text>
                      <text
                        x={hoveredTooltip.x + TOOLTIP_WIDTH - 12}
                        y={hoveredTooltip.y + 81}
                        fontSize="11"
                        fontWeight="700"
                        fill="#FFE4A7"
                        textAnchor="end"
                      >
                        {hoveredTooltip.diffText}
                      </text>
                    </g>
                  )}

                  <g fill="#9FA8B0" fontSize="13" fontWeight="600">
                    {chartData.xTicks.map((tick) => (
                      <text key={tick.label} x={tick.x} y={CHART_VIEWBOX_HEIGHT - 2}>
                        {tick.label}
                      </text>
                    ))}
                  </g>
                </svg>
              </div>

              <div className="relative z-10 mt-3 flex flex-col gap-3 lg:flex-row">
                <button
                  type="button"
                  onClick={() => setShowAvailable((v) => !v)}
                  className={`inline-flex min-h-[56px] w-full items-center justify-center gap-3 rounded-[18px] border px-4 py-3 text-[16px] font-bold shadow-sm transition hover:brightness-[0.98] lg:flex-1 ${showAvailable
                      ? "border-[#B9D0D3] bg-[#EAF4F5] text-[#075E69]"
                      : "border-[#D8E2E3] bg-[#F5FAFA] text-[#8AA8AC]"
                    }`}
                >
                  <span className="relative h-4 w-8">
                    <span
                      className={`absolute left-0 top-1/2 h-[3px] w-full -translate-y-1/2 rounded-full ${showAvailable ? "bg-[#075E69]" : "bg-[#8AA8AC]"
                        }`}
                    />
                    <span
                      className={`absolute left-[8px] top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-[3px] bg-white ${showAvailable ? "border-[#075E69]" : "border-[#8AA8AC]"
                        }`}
                    />
                  </span>
                  Valor disponível
                </button>

                <button
                  type="button"
                  onClick={() => setShowExpenses((v) => !v)}
                  className={`inline-flex min-h-[56px] w-full items-center justify-center gap-3 rounded-[18px] border px-4 py-3 text-[16px] font-bold shadow-sm transition hover:brightness-[0.98] lg:flex-1 ${showExpenses
                      ? "border-[#F2B7B7] bg-[#FFF3F3] text-[#FF5555]"
                      : "border-[#E7D4D4] bg-[#FFF9F9] text-[#D59A9A]"
                    }`}
                >
                  <span className="relative h-4 w-8">
                    <span
                      className={`absolute left-0 top-1/2 h-[3px] w-full -translate-y-1/2 rounded-full ${showExpenses ? "bg-[#FF5555]" : "bg-[#D59A9A]"
                        }`}
                    />
                    <span
                      className={`absolute left-[8px] top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-[3px] bg-white ${showExpenses ? "border-[#FF5555]" : "border-[#D59A9A]"
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
                        className={`hidden sm:inline-flex rounded-full px-4 py-2 text-[12px] font-bold ${item.tone === "green" ? "bg-[#EAF9EF] text-[#35B86B]" : "bg-[#FFF1DB] text-[#F0A126]"
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
      className="relative h-[176px] w-full overflow-hidden rounded-[20px] p-5 pb-12 text-left shadow-[0_10px_24px_rgba(0,0,0,0.07)] transition hover:-translate-y-0.5"
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

      <div className="absolute bottom-0 left-0 right-0 flex h-[48px] items-center justify-between border-t border-white/15 bg-black/12 px-4">
        <div
          className={`max-w-[calc(100%-40px)] truncate ${dark ? "text-white" : accent ? "text-[#5E3000]" : "text-white"
            }`}
        >
          {isLoading ? <div className="h-6 w-36 animate-pulse rounded-full bg-white/30" /> : value}
        </div>
        <span
          className={`material-symbols-outlined !text-[22px] ${dark ? "text-white" : accent ? "text-[#5E3000]" : "text-white"
            }`}
        >
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

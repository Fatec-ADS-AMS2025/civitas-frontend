"use client";

import React, { useMemo, useRef, useState } from "react";
import Input from "@/components/Input";
import Modal from "@/components/modal";
import Form, { type FieldConfig as ModalFieldConfig } from "@/components/Form/form";
import type DespesaDTO from "@/models/despesa";

type Despesa = DespesaDTO & {
  solicitaUc: boolean;
};

type ActionButtonProps = {
  label: string;
  icon: string;
  tone?: "primary" | "secondary";
  compact?: boolean;
  onClick: () => void;
};

type HeroStatProps = {
  index: string;
  title: string;
  value: string;
};

type SummaryCardProps = {
  title: string;
  value: string;
  description: string;
  accent: "teal" | "sand" | "mist" | "orange";
};

type ToneChipProps = {
  label: string;
  tone?: "neutral" | "teal" | "orange" | "sun";
  icon?: string;
};

const initialDespesas: Despesa[] = [
  {
    id: 1,
    descricao: "Material de Escritorio",
    valor: 1240.9,
    data: "2026-03-10",
    categoria: "Administrativo",
    situacao: 1,
    solicitaUc: true,
    fornecedorId: 12,
    secretariaId: 3,
  },
  {
    id: 2,
    descricao: "Transporte Escolar",
    valor: 3890,
    data: "2026-03-08",
    categoria: "Transporte",
    situacao: 1,
    solicitaUc: false,
    fornecedorId: 8,
    secretariaId: 4,
  },
  {
    id: 3,
    descricao: "Alimentacao",
    valor: 5780.45,
    data: "2026-03-05",
    categoria: "Merenda",
    situacao: 1,
    solicitaUc: true,
    fornecedorId: 5,
    secretariaId: 2,
  },
  {
    id: 4,
    descricao: "Manutencao Predial",
    valor: 2460.75,
    data: "2026-02-28",
    categoria: "Infraestrutura",
    situacao: 0,
    solicitaUc: false,
    fornecedorId: 11,
    secretariaId: 1,
  },
];

const emptyDespesa: Despesa = {
  id: 0,
  descricao: "",
  valor: 0,
  data: "",
  categoria: "",
  situacao: 1,
  solicitaUc: false,
  fornecedorId: undefined,
  secretariaId: undefined,
};

const categoriaOptions = [
  { value: "Administrativo", label: "Administrativo" },
  { value: "Transporte", label: "Transporte" },
  { value: "Merenda", label: "Merenda" },
  { value: "Infraestrutura", label: "Infraestrutura" },
];

const despesaFormFields: ModalFieldConfig[] = [
  { key: "id", hidden: true },
  {
    key: "descricao",
    label: "Descricao",
    placeholder: "Descreva a despesa",
    required: true,
  },
  {
    key: "categoria",
    label: "Categoria",
    placeholder: "Selecione a categoria",
    type: "select",
    required: true,
    options: categoriaOptions,
  },
  {
    key: "valor",
    label: "Valor",
    placeholder: "0,00",
    type: "number",
    required: true,
    validate: (value) => {
      const numericValue = Number(value ?? 0);
      if (Number.isNaN(numericValue) || numericValue <= 0) {
        return "Informe um valor maior que zero.";
      }

      return undefined;
    },
  },
  {
    key: "data",
    label: "Data",
    type: "date",
    required: true,
  },
  {
    key: "solicitaUc",
    label: "Solicita UC",
    type: "select",
    required: true,
    options: [
      { value: "true", label: "Sim" },
      { value: "false", label: "Nao" },
    ],
  },
  {
    key: "situacao",
    label: "Situacao",
    type: "select",
    required: true,
    options: [
      { value: "1", label: "Ativo" },
      { value: "0", label: "Inativo" },
    ],
  },
];

const fieldClassName =
  "!mb-0 !rounded-[18px] !border !border-[#D7E7E8] !bg-white !px-4 !py-3.5 !text-[15px] !text-[#28454E] !shadow-[0_12px_28px_rgba(13,77,88,0.06)] focus:!border-[#004C57] focus:!ring-[#D9EDED]";

const filterSelectClassName =
  "w-full rounded-[18px] border border-[#D7E7E8] bg-white px-4 py-3.5 text-[15px] text-[#28454E] shadow-[0_12px_28px_rgba(13,77,88,0.06)] outline-none transition focus:border-[#004C57] focus:ring-4 focus:ring-[#D9EDED]";

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const formatDate = (value?: string) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("pt-BR").format(new Date(`${value}T00:00:00`));
};

const maskCurrency = (value: number, shouldShow: boolean) =>
  shouldShow ? formatCurrency(value) : "R$ ------";

const getDespesaDate = (despesa: Despesa) =>
  despesa.data ?? despesa.dataVencimento ?? despesa.dataEmicao ?? "";

const normalizeDespesa = (formData: Record<string, unknown>): Omit<Despesa, "id"> => ({
  descricao: String(formData.descricao ?? "").trim(),
  valor: Number(formData.valor ?? 0),
  data: String(formData.data ?? ""),
  categoria: String(formData.categoria ?? ""),
  situacao: Number(formData.situacao ?? 1),
  solicitaUc: String(formData.solicitaUc) === "true",
  fornecedorId: formData.fornecedorId ? Number(formData.fornecedorId) : undefined,
  secretariaId: formData.secretariaId ? Number(formData.secretariaId) : undefined,
});

function ToneChip({ label, tone = "neutral", icon }: ToneChipProps) {
  const toneClassName =
    tone === "teal"
      ? "border-[#CAE2E1] bg-[#E5F3F2] text-[#0D4D58]"
      : tone === "orange"
        ? "border-[#F2D5C7] bg-[#FFF0E8] text-[#D5662D]"
        : tone === "sun"
          ? "border-[#F1E2A1] bg-[#FFF7D7] text-[#7B6600]"
          : "border-[#D8E7E8] bg-[#F2F8F8] text-[#49666E]";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${toneClassName}`}
    >
      {icon ? <span className="material-symbols-outlined !text-[16px]">{icon}</span> : null}
      {label}
    </span>
  );
}

function StatusBadge({ situacao }: { situacao?: number }) {
  const isActive = situacao === 1;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
        isActive
          ? "border-[#CBE3E2] bg-[#E6F5F4] text-[#0D4D58]"
          : "border-[#D9E4E6] bg-[#EFF4F5] text-[#6B7E84]"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${isActive ? "bg-[#58AFAE]" : "bg-[#A9B8BD]"}`}
      />
      {isActive ? "Ativo" : "Inativo"}
    </span>
  );
}

function ActionButton({
  label,
  icon,
  tone = "primary",
  compact = false,
  onClick,
}: ActionButtonProps) {
  const toneClassName =
    tone === "secondary"
      ? "bg-[#FF6324] text-white shadow-[0_16px_32px_rgba(255,99,36,0.20)] hover:bg-[#F25B1A]"
      : "bg-[#0D5661] text-white shadow-[0_16px_32px_rgba(13,86,97,0.18)] hover:bg-[#094852]";

  const sizeClassName = compact ? "px-4 py-2.5 text-sm" : "px-5 py-3 text-sm";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition ${toneClassName} ${sizeClassName}`}
      aria-label={label}
      title={label}
    >
      <span className="material-symbols-outlined !text-[18px]">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function HeroStat({ index, title, value }: HeroStatProps) {
  return (
    <article className="rounded-[28px] border border-white/80 bg-white/80 p-5 shadow-[0_20px_42px_rgba(13,77,88,0.07)] backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#6A8187]">
            {title}
          </p>
          <p className="mt-5 text-[42px] font-semibold leading-none tracking-[-0.04em] text-[#103E49]">
            {value}
          </p>
        </div>
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F2F8F8] text-sm font-bold text-[#0D4D58]">
          {index}
        </span>
      </div>
    </article>
  );
}

function SummaryCard({ title, value, description, accent }: SummaryCardProps) {
  const surfaceClassName =
    accent === "teal"
      ? "border-[#D1E6E6] bg-[#F3FAFA]"
      : accent === "sand"
        ? "border-[#F1E2D4] bg-[#FFF9F3]"
        : accent === "mist"
          ? "border-[#D4E7E7] bg-[#ECF8F7]"
          : "border-[#F1D7C9] bg-[#FFF4EC]";

  const glowClassName =
    accent === "teal"
      ? "bg-[#D9EEEE]"
      : accent === "sand"
        ? "bg-[#FCEAD8]"
        : accent === "mist"
          ? "bg-[#DFF0EF]"
          : "bg-[#FFE1D1]";

  return (
    <article
      className={`relative overflow-hidden rounded-[28px] border p-6 shadow-[0_18px_30px_rgba(13,77,88,0.06)] ${surfaceClassName}`}
    >
      <div className={`absolute -right-8 top-4 h-24 w-24 rounded-full blur-2xl ${glowClassName}`} />
      <p className="relative z-10 text-xs font-semibold uppercase tracking-[0.16em] text-[#60757B]">
        {title}
      </p>
      <p className="relative z-10 mt-5 text-[clamp(2rem,3vw,3rem)] font-semibold leading-none tracking-[-0.05em] text-[#103E49]">
        {value}
      </p>
      <p className="relative z-10 mt-4 text-base leading-7 text-[#5F747A]">{description}</p>
    </article>
  );
}

export default function Page() {
  const [despesas, setDespesas] = useState<Despesa[]>(initialDespesas);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("");
  const [solicitaUcFilter, setSolicitaUcFilter] = useState("");
  const [situacaoFilter, setSituacaoFilter] = useState("");
  const [periodStartFilter, setPeriodStartFilter] = useState("");
  const [periodEndFilter, setPeriodEndFilter] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDespesa, setEditingDespesa] = useState<Despesa | null>(null);
  const [showFinancialValues, setShowFinancialValues] = useState(true);

  const listSectionRef = useRef<HTMLElement | null>(null);

  const effectivePeriod = useMemo(() => {
    if (periodStartFilter && periodEndFilter && periodStartFilter > periodEndFilter) {
      return {
        start: periodEndFilter,
        end: periodStartFilter,
      };
    }

    return {
      start: periodStartFilter,
      end: periodEndFilter,
    };
  }, [periodEndFilter, periodStartFilter]);

  const filteredDespesas = useMemo(() => {
    const normalizedQuery = normalizeText(searchQuery);

    return despesas.filter((despesa) => {
      const descricao = normalizeText(despesa.descricao ?? "");
      const categoria = normalizeText(despesa.categoria ?? "");
      const despesaDate = getDespesaDate(despesa);
      const matchesQuery =
        normalizedQuery.length === 0 ||
        descricao.includes(normalizedQuery) ||
        categoria.includes(normalizedQuery) ||
        String(despesa.id).includes(normalizedQuery);

      const matchesCategoria =
        categoriaFilter.length === 0 || despesa.categoria === categoriaFilter;

      const matchesSolicitaUc =
        solicitaUcFilter.length === 0 ||
        (solicitaUcFilter === "sim" && despesa.solicitaUc) ||
        (solicitaUcFilter === "nao" && !despesa.solicitaUc);

      const matchesSituacao =
        situacaoFilter.length === 0 ||
        (situacaoFilter === "ativo" && despesa.situacao === 1) ||
        (situacaoFilter === "inativo" && despesa.situacao === 0);

      const matchesStart =
        effectivePeriod.start.length === 0 ||
        (despesaDate.length > 0 && despesaDate >= effectivePeriod.start);

      const matchesEnd =
        effectivePeriod.end.length === 0 ||
        (despesaDate.length > 0 && despesaDate <= effectivePeriod.end);

      return (
        matchesQuery &&
        matchesCategoria &&
        matchesSolicitaUc &&
        matchesSituacao &&
        matchesStart &&
        matchesEnd
      );
    });
  }, [
    categoriaFilter,
    despesas,
    effectivePeriod.end,
    effectivePeriod.start,
    searchQuery,
    solicitaUcFilter,
    situacaoFilter,
  ]);

  const totalGastos = filteredDespesas.reduce((acc, despesa) => acc + (despesa.valor ?? 0), 0);
  const despesasAtivas = filteredDespesas.filter((despesa) => despesa.situacao === 1).length;
  const despesasComUc = filteredDespesas.filter((despesa) => despesa.solicitaUc).length;
  const categoriasVisiveis = new Set(
    filteredDespesas.map((despesa) => despesa.categoria ?? "Sem categoria")
  ).size;
  const ticketMedio = filteredDespesas.length > 0 ? totalGastos / filteredDespesas.length : 0;

  const latestDate = useMemo(() => {
    const source = filteredDespesas.length > 0 ? filteredDespesas : despesas;

    return (
      source
        .map((item) => getDespesaDate(item))
        .filter((value): value is string => value.length > 0)
        .sort((left, right) => right.localeCompare(left))[0] ?? ""
    );
  }, [despesas, filteredDespesas]);

  const featuredDespesa = filteredDespesas[0] ?? despesas[0] ?? null;

  const periodFilterLabel =
    effectivePeriod.start && effectivePeriod.end
      ? `Periodo: ${formatDate(effectivePeriod.start)} a ${formatDate(effectivePeriod.end)}`
      : effectivePeriod.start
        ? `A partir de ${formatDate(effectivePeriod.start)}`
        : effectivePeriod.end
          ? `Ate ${formatDate(effectivePeriod.end)}`
          : "";

  const activeFilters = [
    searchQuery.trim() ? `Busca: ${searchQuery.trim()}` : "",
    categoriaFilter ? `Categoria: ${categoriaFilter}` : "",
    solicitaUcFilter
      ? `UC: ${solicitaUcFilter === "sim" ? "Com solicitacao" : "Sem solicitacao"}`
      : "",
    situacaoFilter ? `Situacao: ${situacaoFilter === "ativo" ? "Ativa" : "Inativa"}` : "",
    periodFilterLabel,
  ].filter(Boolean);

  const heroStats = [
    { title: "Despesas monitoradas", value: String(filteredDespesas.length) },
    { title: "Categorias visiveis", value: String(categoriasVisiveis) },
    { title: "Filtros ativos", value: String(activeFilters.length) },
  ];

  const summaryCards: SummaryCardProps[] = [
    {
      title: "Total de despesas",
      value: maskCurrency(totalGastos, showFinancialValues),
      description: "Saida consolidada das despesas visiveis no recorte atual.",
      accent: "teal",
    },
    {
      title: "Ticket medio",
      value: maskCurrency(ticketMedio, showFinancialValues),
      description: "Media por despesa considerando os filtros aplicados.",
      accent: "sand",
    },
    {
      title: "Despesas ativas",
      value: String(despesasAtivas),
      description: "Itens liberados para acompanhamento e manutencao.",
      accent: "mist",
    },
    {
      title: "Solicitam UC",
      value: String(despesasComUc),
      description: "Registros que dependem de unidade consumidora.",
      accent: "orange",
    },
  ];

  const listOverview = [
    {
      label: "Total",
      value: String(filteredDespesas.length),
      className: "border-[#D7E8E8] bg-[#F5FBFB] text-[#103E49]",
    },
    {
      label: "Ativas",
      value: String(despesasAtivas),
      className: "border-[#F1DACD] bg-[#FFF4EC] text-[#D5662D]",
    },
    {
      label: "Com UC",
      value: String(despesasComUc),
      className: "border-[#D6E8E7] bg-[#EDF7F7] text-[#103E49]",
    },
  ];

  const clearFilters = () => {
    setSearchQuery("");
    setCategoriaFilter("");
    setSolicitaUcFilter("");
    setSituacaoFilter("");
    setPeriodStartFilter("");
    setPeriodEndFilter("");
  };

  const scrollToList = () => {
    listSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCreate = async (formData: Record<string, unknown>) => {
    const payload = normalizeDespesa(formData);

    setDespesas((current) => [
      {
        id: current.length > 0 ? Math.max(...current.map((item) => item.id)) + 1 : 1,
        ...payload,
      },
      ...current,
    ]);
    setIsCreateModalOpen(false);
  };

  const handleEdit = async (formData: Record<string, unknown>) => {
    if (!editingDespesa) return;

    const payload = normalizeDespesa(formData);

    setDespesas((current) =>
      current.map((item) =>
        item.id === editingDespesa.id
          ? {
              ...item,
              ...payload,
            }
          : item
      )
    );
    setEditingDespesa(null);
  };

  const handleDelete = (id: number, descricao?: string) => {
    const shouldDelete = window.confirm(
      `Deseja excluir a despesa${descricao ? ` "${descricao}"` : ""}?`
    );

    if (!shouldDelete) return;

    setDespesas((current) => current.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-[40px] border border-[#CFE5E5] bg-[linear-gradient(135deg,#FEFFFE_0%,#F5FBFB_58%,#FFF8F3_100%)] shadow-[0_30px_80px_rgba(13,77,88,0.08)]">
        <div className="pointer-events-none absolute left-10 top-10 h-40 w-40 rounded-full bg-[rgba(202,233,233,0.52)] blur-[70px]" />
        <div className="pointer-events-none absolute right-10 top-8 h-44 w-44 rounded-full bg-[rgba(255,135,41,0.18)] blur-[75px]" />
        <div className="pointer-events-none absolute bottom-[-72px] left-[28%] h-44 w-44 rounded-full bg-[rgba(88,175,174,0.18)] blur-[75px]" />

        <div className="relative grid gap-8 px-6 py-8 md:px-8 lg:px-10 xl:grid-cols-[minmax(0,1.22fr)_320px] xl:items-start">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0D4D58] shadow-[0_12px_24px_rgba(13,77,88,0.06)]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF6324]" />
              Modulo financeiro
            </div>

            <h1 className="mt-6 max-w-4xl text-[clamp(2.7rem,6vw,5.4rem)] font-semibold leading-[0.95] tracking-[-0.07em] text-[#103E49]">
              Acompanhe despesas, filtros e manutencao em um unico painel.
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#5E747A]">
              Visualize o resumo local, aplique filtros com mais clareza e gerencie os
              registros de despesas com a mesma linguagem visual da tela de referencia.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#0E5A66] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(13,86,97,0.18)]">
                <span className="material-symbols-outlined !text-[18px]">schedule</span>
                Ultima movimentacao: {formatDate(latestDate)}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#F1D9CA] bg-white/80 px-5 py-3 text-sm font-semibold text-[#D5662D]">
                <span className="material-symbols-outlined !text-[18px]">verified</span>
                Painel local atualizado
              </span>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <ActionButton
                label="Cadastrar despesa"
                icon="add_circle"
                tone="primary"
                onClick={() => setIsCreateModalOpen(true)}
              />
              <ActionButton
                label="Ir para listagem"
                icon="south"
                tone="secondary"
                onClick={scrollToList}
              />
              <button
                type="button"
                onClick={() => setShowFinancialValues((current) => !current)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D7E8E8] bg-white/80 px-5 py-3 text-sm font-semibold text-[#0D4D58] transition hover:bg-white"
              >
                <span className="material-symbols-outlined !text-[18px]">
                  {showFinancialValues ? "visibility_off" : "visibility"}
                </span>
                {showFinancialValues ? "Ocultar valores" : "Exibir valores"}
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            {heroStats.map((stat, index) => (
              <HeroStat
                key={stat.title}
                index={String(index + 1).padStart(2, "0")}
                title={stat.title}
                value={stat.value}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <SummaryCard key={card.title} {...card} />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.12fr)_minmax(340px,0.88fr)]">
        <article className="rounded-[36px] border border-[#CFE4E5] bg-[linear-gradient(180deg,#FFFFFF_0%,#F6FBFB_100%)] p-6 shadow-[0_24px_48px_rgba(13,77,88,0.06)]">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E6F4F3] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0D4D58]">
            <span className="material-symbols-outlined !text-[16px]">tune</span>
            Filtros
          </div>

          <h2 className="mt-5 text-[clamp(2rem,3.2vw,3.35rem)] font-semibold tracking-[-0.05em] text-[#103E49]">
            Refinar visao de despesas
          </h2>

          <p className="mt-4 max-w-2xl text-base leading-8 text-[#5E747A]">
            Combine periodo, categoria, status e busca textual para encontrar
            rapidamente os registros que importam. A listagem responde em tempo real.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Input
              type="date"
              label="Inicio do periodo"
              value={periodStartFilter}
              onChange={(event) => setPeriodStartFilter(event.target.value)}
              className={fieldClassName}
            />

            <Input
              type="date"
              label="Fim do periodo"
              value={periodEndFilter}
              onChange={(event) => setPeriodEndFilter(event.target.value)}
              className={fieldClassName}
            />

            <div>
              <label className="mb-2 block text-sm font-semibold tracking-[0.01em] text-[#4D5A63]">
                Categoria
              </label>
              <select
                value={categoriaFilter}
                onChange={(event) => setCategoriaFilter(event.target.value)}
                className={filterSelectClassName}
              >
                <option value="">Todas</option>
                {categoriaOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold tracking-[0.01em] text-[#4D5A63]">
                Situacao
              </label>
              <select
                value={situacaoFilter}
                onChange={(event) => setSituacaoFilter(event.target.value)}
                className={filterSelectClassName}
              >
                <option value="">Todas</option>
                <option value="ativo">Ativas</option>
                <option value="inativo">Inativas</option>
              </select>
            </div>

            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Busque por descricao, categoria ou ID"
              label="Busca rapida"
              className={fieldClassName}
            />

            <div>
              <label className="mb-2 block text-sm font-semibold tracking-[0.01em] text-[#4D5A63]">
                Solicita UC
              </label>
              <select
                value={solicitaUcFilter}
                onChange={(event) => setSolicitaUcFilter(event.target.value)}
                className={filterSelectClassName}
              >
                <option value="">Todos</option>
                <option value="sim">Com solicitacao</option>
                <option value="nao">Sem solicitacao</option>
              </select>
            </div>
          </div>

          <div className="mt-8 border-t border-[#E5F0EF] pt-6">
            <div className="flex flex-wrap gap-3">
              <ActionButton
                label="Aplicar filtros"
                icon="filter_alt"
                tone="primary"
                onClick={scrollToList}
              />
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D5E7E7] bg-white px-5 py-3 text-sm font-semibold text-[#0D4D58] transition hover:bg-[#F7FBFB]"
              >
                <span className="material-symbols-outlined !text-[18px]">restart_alt</span>
                Limpar painel
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {activeFilters.length > 0 ? (
                activeFilters.map((filter) => (
                  <ToneChip key={filter} label={filter} tone="teal" icon="sell" />
                ))
              ) : (
                <span className="text-sm leading-7 text-[#62777D]">
                  Nenhum filtro aplicado. A tela mostra todas as despesas locais.
                </span>
              )}
            </div>
          </div>
        </article>

        <article className="rounded-[36px] border border-[#CFE4E5] bg-[linear-gradient(180deg,#FFFFFF_0%,#F6FBFB_100%)] p-6 shadow-[0_24px_48px_rgba(13,77,88,0.06)]">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF0E8] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#D5662D]">
            <span className="material-symbols-outlined !text-[16px]">apps</span>
            Operacao
          </div>

          <h2 className="mt-5 text-[clamp(2rem,3.2vw,3.35rem)] font-semibold tracking-[-0.05em] text-[#103E49]">
            Cadastro e manutencao
          </h2>

          <p className="mt-4 text-base leading-8 text-[#5E747A]">
            Cadastre novas despesas, acompanhe o destaque atual da listagem e siga
            para edicao com menos cliques.
          </p>

          <div className="mt-8 grid gap-4 2xl:grid-cols-2">
            <div className="rounded-[30px] border border-[#D5E8E8] bg-white p-5 shadow-[0_16px_32px_rgba(13,77,88,0.05)]">
              <ToneChip label="Novo registro" tone="teal" />
              <h3 className="mt-4 text-[30px] font-semibold tracking-[-0.04em] text-[#103E49]">
                Cadastrar despesa
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#5F747A]">
                Abra o formulario modal para incluir um novo item sem sair da tela.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] bg-[#F3FAF9] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6A848A]">
                    Registros locais
                  </p>
                  <p className="mt-2 text-[28px] font-semibold leading-none tracking-[-0.04em] text-[#103E49]">
                    {despesas.length}
                  </p>
                </div>

                <div className="rounded-[22px] bg-[#FFF7F1] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#C27746]">
                    Com UC
                  </p>
                  <p className="mt-2 text-[28px] font-semibold leading-none tracking-[-0.04em] text-[#103E49]">
                    {despesasComUc}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <ActionButton
                  label="Abrir cadastro"
                  icon="add"
                  tone="primary"
                  onClick={() => setIsCreateModalOpen(true)}
                />
              </div>
            </div>

            <div className="rounded-[30px] border border-[#F2DACD] bg-[#FFFBF8] p-5 shadow-[0_16px_32px_rgba(255,99,36,0.06)]">
              <ToneChip label="Manutencao" tone="orange" />
              <h3 className="mt-4 text-[30px] font-semibold tracking-[-0.04em] text-[#103E49]">
                Atualizar destaque
              </h3>

              {featuredDespesa ? (
                <>
                  <p className="mt-3 text-lg font-semibold text-[#163E49]">
                    {featuredDespesa.descricao ?? `Despesa #${featuredDespesa.id}`}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[#7C665B]">
                    Registro em contexto para uma manutencao rapida com base nos filtros
                    atuais.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <ToneChip
                      label={`#${String(featuredDespesa.id).padStart(3, "0")}`}
                      tone="sun"
                    />
                    <ToneChip
                      label={featuredDespesa.categoria ?? "Sem categoria"}
                      tone="neutral"
                      icon="category"
                    />
                    <ToneChip
                      label={formatDate(getDespesaDate(featuredDespesa))}
                      tone="neutral"
                      icon="calendar_month"
                    />
                  </div>

                  <div className="mt-5 rounded-[24px] border border-white/80 bg-white/85 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8D7668]">
                      Contexto atual
                    </p>
                    <p className="mt-3 text-[28px] font-semibold leading-none tracking-[-0.04em] text-[#103E49]">
                      {maskCurrency(featuredDespesa.valor ?? 0, showFinancialValues)}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <StatusBadge situacao={featuredDespesa.situacao} />
                      <ToneChip
                        label={
                          featuredDespesa.solicitaUc
                            ? "Com solicitacao"
                            : "Sem solicitacao"
                        }
                        tone={featuredDespesa.solicitaUc ? "teal" : "neutral"}
                        icon={featuredDespesa.solicitaUc ? "bolt" : "remove_circle"}
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <ActionButton
                      label="Editar destaque"
                      icon="edit_square"
                      tone="secondary"
                      onClick={() => setEditingDespesa(featuredDespesa)}
                    />
                    <button
                      type="button"
                      onClick={scrollToList}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E8D5CB] bg-white px-5 py-3 text-sm font-semibold text-[#A45325] transition hover:bg-[#FFF7F2]"
                    >
                      <span className="material-symbols-outlined !text-[18px]">table_rows</span>
                      Ver listagem
                    </button>
                  </div>
                </>
              ) : (
                <div className="mt-5 rounded-[24px] border border-dashed border-[#E6D3C9] bg-white/80 p-5 text-sm leading-7 text-[#7A685F]">
                  Nenhum registro disponivel no momento.
                </div>
              )}
            </div>
          </div>
        </article>
      </section>

      <section
        ref={listSectionRef}
        className="overflow-hidden rounded-[40px] border border-[#CFE5E5] bg-[linear-gradient(180deg,#FFFFFF_0%,#F6FBFB_100%)] p-3 shadow-[0_30px_80px_rgba(13,77,88,0.08)]"
      >
        <div className="rounded-[30px] border border-[#E0ECEC] bg-white px-5 py-6 shadow-[0_20px_45px_rgba(13,77,88,0.05)] sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#E6F4F3] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0D4D58]">
                <span className="material-symbols-outlined !text-[16px]">monitoring</span>
                Monitoramento
              </div>

              <h2 className="mt-5 text-[clamp(2rem,3.3vw,3.8rem)] font-semibold tracking-[-0.05em] text-[#103E49]">
                Listagem de despesas
              </h2>

              <p className="mt-3 max-w-2xl text-base leading-8 text-[#5E747A]">
                Painel com leitura rapida de categoria, valor, data, situacao e acoes
                de manutencao para cada despesa local.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {listOverview.map((item) => (
                <article
                  key={item.label}
                  className={`rounded-[24px] border px-5 py-4 shadow-[0_14px_24px_rgba(13,77,88,0.04)] ${item.className}`}
                >
                  <p className="text-sm font-semibold text-current/75">{item.label}</p>
                  <p className="mt-3 text-[22px] font-semibold leading-none tracking-[-0.04em] text-current">
                    {item.value}
                  </p>
                </article>
              ))}
            </div>
          </div>

          {filteredDespesas.length === 0 ? (
            <div className="mt-8 flex flex-col items-center justify-center gap-4 rounded-[28px] border border-dashed border-[#D8E8E8] bg-[#F8FCFC] px-6 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F5F4] text-[#0D4D58]">
                <span className="material-symbols-outlined !text-[28px]">search_off</span>
              </div>
              <h3 className="text-[26px] font-semibold tracking-[-0.04em] text-[#103E49]">
                Nenhuma despesa encontrada
              </h3>
              <p className="max-w-xl text-sm leading-7 text-[#6A7D83]">
                Ajuste os filtros ou cadastre uma nova despesa para voltar a preencher
                a listagem.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D5E7E7] bg-white px-5 py-3 text-sm font-semibold text-[#0D4D58] transition hover:bg-[#F7FBFB]"
                >
                  <span className="material-symbols-outlined !text-[18px]">restart_alt</span>
                  Limpar filtros
                </button>
                <ActionButton
                  label="Nova despesa"
                  icon="add"
                  tone="primary"
                  onClick={() => setIsCreateModalOpen(true)}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="mt-8 hidden overflow-hidden rounded-[28px] border border-[#D7E8E8] lg:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-[#F2F7F7]">
                      <tr className="text-left text-[12px] font-semibold uppercase tracking-[0.16em] text-[#748C93]">
                        <th className="px-6 py-4">Registro</th>
                        <th className="px-6 py-4">Categoria</th>
                        <th className="px-6 py-4">Descricao</th>
                        <th className="px-6 py-4">Valor</th>
                        <th className="px-6 py-4">Data</th>
                        <th className="px-6 py-4">Situacao</th>
                        <th className="px-6 py-4 text-right">Acao</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E6EFEF] bg-white">
                      {filteredDespesas.map((despesa) => (
                        <tr key={despesa.id} className="transition hover:bg-[#FBFDFC]">
                          <td className="px-6 py-5 align-top">
                            <div className="flex items-start gap-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF5F4] text-[#0D5661]">
                                <span className="material-symbols-outlined !text-[20px]">
                                  receipt_long
                                </span>
                              </div>
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7B949A]">
                                  Registro
                                </p>
                                <p className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#103E49]">
                                  #{String(despesa.id).padStart(3, "0")}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 align-top">
                            <ToneChip
                              label={despesa.categoria ?? "Sem categoria"}
                              tone="neutral"
                              icon="category"
                            />
                          </td>
                          <td className="px-6 py-5 align-top">
                            <div className="max-w-[24rem]">
                              <p className="text-[16px] font-semibold text-[#163E49]">
                                {despesa.descricao ?? "-"}
                              </p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <ToneChip
                                  label={
                                    despesa.solicitaUc
                                      ? "Com solicitacao de UC"
                                      : "Sem solicitacao de UC"
                                  }
                                  tone={despesa.solicitaUc ? "teal" : "neutral"}
                                  icon={despesa.solicitaUc ? "bolt" : "remove_circle"}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 align-top text-[18px] font-semibold tracking-[-0.03em] text-[#163E49]">
                            {maskCurrency(despesa.valor ?? 0, showFinancialValues)}
                          </td>
                          <td className="px-6 py-5 align-top text-sm font-semibold text-[#38575E]">
                            {formatDate(getDespesaDate(despesa))}
                          </td>
                          <td className="px-6 py-5 align-top">
                            <StatusBadge situacao={despesa.situacao} />
                          </td>
                          <td className="px-6 py-5 align-top">
                            <div className="flex flex-wrap justify-end gap-2">
                              <ActionButton
                                compact
                                label="Editar"
                                icon="edit_square"
                                tone="primary"
                                onClick={() => setEditingDespesa(despesa)}
                              />
                              <ActionButton
                                compact
                                label="Excluir"
                                icon="delete"
                                tone="secondary"
                                onClick={() => handleDelete(despesa.id, despesa.descricao)}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-8 space-y-4 lg:hidden">
                {filteredDespesas.map((despesa) => (
                  <article
                    key={despesa.id}
                    className="rounded-[28px] border border-[#D8E8E8] bg-white p-5 shadow-[0_18px_36px_rgba(13,77,88,0.05)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <ToneChip
                          label={`#${String(despesa.id).padStart(3, "0")}`}
                          tone="sun"
                        />
                        <h3 className="mt-4 text-xl font-semibold tracking-[-0.04em] text-[#103E49]">
                          {despesa.descricao ?? "-"}
                        </h3>
                      </div>
                      <StatusBadge situacao={despesa.situacao} />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <ToneChip
                        label={despesa.categoria ?? "Sem categoria"}
                        tone="neutral"
                        icon="category"
                      />
                      <ToneChip
                        label={
                          despesa.solicitaUc ? "Com solicitacao de UC" : "Sem solicitacao de UC"
                        }
                        tone={despesa.solicitaUc ? "teal" : "neutral"}
                        icon={despesa.solicitaUc ? "bolt" : "remove_circle"}
                      />
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[22px] bg-[#F4FBFB] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6D858A]">
                          Valor
                        </p>
                        <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[#103E49]">
                          {maskCurrency(despesa.valor ?? 0, showFinancialValues)}
                        </p>
                      </div>

                      <div className="rounded-[22px] bg-[#FFF7F1] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#C27746]">
                          Data
                        </p>
                        <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[#103E49]">
                          {formatDate(getDespesaDate(despesa))}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <ActionButton
                        compact
                        label="Editar"
                        icon="edit_square"
                        tone="primary"
                        onClick={() => setEditingDespesa(despesa)}
                      />
                      <ActionButton
                        compact
                        label="Excluir"
                        icon="delete"
                        tone="secondary"
                        onClick={() => handleDelete(despesa.id, despesa.descricao)}
                      />
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {isCreateModalOpen && (
        <Modal value={isCreateModalOpen} setValue={setIsCreateModalOpen}>
          <Form
            object={{
              ...emptyDespesa,
              solicitaUc: String(emptyDespesa.solicitaUc),
              situacao: String(emptyDespesa.situacao),
            }}
            name="despesa"
            type="create"
            fields={despesaFormFields}
            onCancel={() => setIsCreateModalOpen(false)}
            onConfirm={handleCreate}
          />
        </Modal>
      )}

      {editingDespesa && (
        <Modal value={true} setValue={() => setEditingDespesa(null)}>
          <Form
            object={{
              ...editingDespesa,
              solicitaUc: String(editingDespesa.solicitaUc),
              situacao: String(editingDespesa.situacao),
            }}
            name="despesa"
            type="edit"
            fields={despesaFormFields}
            onCancel={() => setEditingDespesa(null)}
            onConfirm={handleEdit}
          />
        </Modal>
      )}
    </div>
  );
}

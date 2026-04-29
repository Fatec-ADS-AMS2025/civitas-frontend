"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  DespesasRelacionadasTable,
  InsightsGrid,
  InsightsModal,
  type InsightMetric,
} from "@/components/financeiro-insights";
import Form, { type FieldConfig as ModalFieldConfig } from "@/components/Form/form";
import ExportModal from "@/components/Table/export-modal";
import Input from "@/components/Input";
import { useDashboardHeader } from "@/components/dashboard/dashboard-header";
import Modal from "@/components/modal";
import {
  exportTableData,
  getSelectedColumns,
} from "@/components/Table/export-utils";
import type {
  TableColumn,
  TableExportOptions,
} from "@/components/Table/export-types";
import { showToast } from "@/hooks/useToast";
import {
  digitsOnly,
  normalizeDateInput,
  validateDespesaDateRange,
  validateRequiredUc,
} from "@/global/formPayload";
import { SITUACAO_ATIVO, SITUACAO_OPTIONS } from "@/global/situacao";
import {
  type DespesasDashboardFilters,
  type DespesaDashboardRow,
  useDespesasDashboard,
} from "@/hooks/useDespesasDashboard";
import {
  buildFinanceRelations,
  type FinanceCodigoResumo,
  type FinanceInstituicaoResumo,
} from "@/lib/financeiro-relations";

type SelectOption = {
  value: string | number;
  label: string;
};

type DespesaExportRow = {
  id: number;
  codigo: string;
  categoria: string;
  descricao: string;
  valor: string;
  data: string;
  situacao: number;
};

const DESPESAS_EXPORT_COLUMNS: TableColumn[] = [
  { id: "id", label: "Registro" },
  { id: "codigo", label: "Codigo" },
  { id: "categoria", label: "Categoria" },
  { id: "descricao", label: "Descricao" },
  { id: "valor", label: "Valor" },
  { id: "data", label: "Data" },
  { id: "situacao", label: "Situacao" },
];

const DESPESAS_EXPORT_TITLE = "Listagem de despesas";
const DESPESAS_EXPORT_FILE_NAME = "despesas";

const SOLICITA_UC_OPTIONS: SelectOption[] = [
  { value: "1", label: "Sim" },
  { value: "2", label: "Nao" },
];

const STATUS_OPTIONS: SelectOption[] = [
  { value: "1", label: "A pagar" },
  { value: "2", label: "Paga" },
  { value: "3", label: "Atrasada" },
];

const INITIAL_FILTER_FORM: DespesasDashboardFilters = {
  search: "",
  dataInicio: "",
  dataFim: "",
  idTipoDespesa: "",
  situacao: "",
  solicitaUc: "",
};

const EMPTY_DESPESA_FORM = {
  id: 0,
  numeroDocumento: "",
  codigo: "",
  idTipoDespesa: "",
  uc: "",
  consumoPrevisto: "",
  dataEmicao: "",
  dataVencimento: "",
  idInstituicao: "",
  idOrcamento: "",
  idFornecedor: "",
  idUsuario: "",
  situacao: SITUACAO_ATIVO,
};

const filterFieldClassName =
  "despesas-filter-field w-full rounded-sm border border-[var(--border-default)] bg-[rgba(255,255,255,0.92)] px-4 py-3 text-sm text-[var(--foreground)] shadow-[var(--shadow-xs)] outline-none transition-all duration-[var(--motion-duration-fast)] focus:border-[var(--secundary-1)] focus:ring-4 focus:ring-[var(--focus-ring)]";

const iconButtonClassName =
  "flex h-9 w-9 items-center justify-center rounded-sm border border-[var(--border-soft)] bg-[rgba(255,255,255,0.92)] text-[var(--secundary-1)] shadow-[var(--shadow-xs)] transition-all duration-[var(--motion-duration-fast)] hover:-translate-y-[1px] hover:bg-[var(--surface-subtle)] hover:shadow-[var(--shadow-sm)]";

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatDateTime = (value?: string | null): string => {
  if (!value) return "Agora";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
};

const toPositiveNumber = (value: unknown): number => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const ensureOption = (
  options: SelectOption[],
  currentValue: number | undefined,
  fallbackLabel: string
): SelectOption[] => {
  if (!currentValue || options.some((option) => Number(option.value) === currentValue)) {
    return options;
  }

  return [
    ...options,
    {
      value: currentValue,
      label: fallbackLabel,
    },
  ];
};

const buildDespesaFormObject = (
  despesa?: DespesaDashboardRow | null
): Record<string, unknown> => {
  if (!despesa) {
    return EMPTY_DESPESA_FORM;
  }

  return {
    id: despesa.id,
    numeroDocumento: despesa.raw.numeroDocumento ?? "",
    codigo: despesa.raw.codigo ?? "",
    idTipoDespesa: despesa.raw.idTipoDespesa ?? "",
    uc: despesa.raw.uc ?? "",
    consumoPrevisto: despesa.raw.consumoPrevisto ?? despesa.raw.valor ?? "",
    dataEmicao:
      normalizeDateInput(despesa.raw.dataEmissao) ??
      normalizeDateInput(despesa.raw.dataEmicao) ??
      normalizeDateInput(despesa.raw.data) ??
      "",
    dataVencimento:
      normalizeDateInput(despesa.raw.dataVencimento) ??
      normalizeDateInput(despesa.raw.data) ??
      "",
    idInstituicao: despesa.raw.idInstituicao ?? "",
    idOrcamento: despesa.raw.idOrcamento ?? "",
    idFornecedor: despesa.raw.idFornecedor ?? despesa.raw.fornecedorId ?? "",
    idUsuario: despesa.raw.idUsuario ?? "",
    situacao: despesa.raw.status ?? despesa.raw.situacao ?? SITUACAO_ATIVO,
  };
};

const getStatusBadgeClassName = (status: number): string => {
  if (status === 2) {
    return "civitas-badge--status-active";
  }

  if (status === 3) {
    return "civitas-badge--status-inactive";
  }

  return "civitas-badge--status-neutral";
};

const SummaryCard = ({
  title,
  subtitle,
  value,
  visible,
  background,
  icon,
}: {
  title: string;
  subtitle: string;
  value: number;
  visible: boolean;
  background: string;
  icon: string;
}) => {
  return (
    <article
      className="despesas-summary-card relative overflow-hidden rounded-sm p-5 text-white shadow-[0_18px_32px_rgba(0,0,0,0.10)]"
      style={{ background }}
    >
      <div className="despesas-summary-card__sheen absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent_56%)]" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.08em] text-white/70">
            Conta digital
          </p>
          <h2 className="mt-4 text-[30px] font-semibold leading-none">{title}</h2>
          <p className="mt-2 text-sm text-white/75">{subtitle}</p>
        </div>

        <span className="despesas-summary-card__icon flex h-16 w-16 items-center justify-center rounded-sm border border-white/20 bg-white/10">
          <span className="material-symbols-outlined !text-[34px] text-white/80">
            {icon}
          </span>
        </span>
      </div>

      <div className="despesas-summary-card__value relative z-10 mt-5 rounded-sm border border-white/10 bg-white/14 px-4 py-3">
        <p className="text-xs uppercase tracking-[0.18em] text-white/60">Valor atual</p>
        <p className="mt-2 text-[28px] font-semibold leading-none">
          {visible ? formatCurrency(value) : "* * * * * *"}
        </p>
      </div>
    </article>
  );
};

const LoadingState = () => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={`summary-skeleton-${index}`}
            className="h-[180px] animate-pulse rounded-sm bg-[#E7EFF1]"
          />
        ))}
      </div>

      <div className="h-[240px] animate-pulse rounded-sm bg-[#EEF5F6]" />
      <div className="h-[360px] animate-pulse rounded-sm bg-[#EEF5F6]" />
    </div>
  );
};

export default function Page() {
  const listSectionRef = useRef<HTMLElement | null>(null);
  const [filterForm, setFilterForm] = useState(INITIAL_FILTER_FORM);
  const [valuesVisible, setValuesVisible] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDespesa, setEditingDespesa] = useState<DespesaDashboardRow | null>(null);
  const [viewingDespesa, setViewingDespesa] = useState<DespesaDashboardRow | null>(null);
  const [selectedCodigoGroup, setSelectedCodigoGroup] = useState<FinanceCodigoResumo | null>(null);
  const [selectedInstituicaoGroup, setSelectedInstituicaoGroup] =
    useState<FinanceInstituicaoResumo | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const {
    despesas,
    filteredDespesas,
    tiposDespesa,
    orcamentos,
    instituicoes,
    secretarias,
    fornecedores,
    usuarios,
    summary,
    loading,
    error,
    empty,
    lastUpdatedAt,
    applyFilters,
    clearFilters,
    createDespesa,
    updateDespesa,
    removeDespesa,
    refetch,
  } = useDespesasDashboard();

  const headerConfig = useMemo(
    () => ({
      title: "Despesas",
      eyebrow: "Operação",
      subtitle:
        "Centralize filtros, cadastro e manutenção das despesas com feedback rápido e leitura desktop consistente.",
      breadcrumbs: [
        { label: "Home", href: "/dashboard" },
        { label: "Cadastros", href: "/dashboard/despesas" },
        { label: "Despesas" },
      ],
      actions: [
        {
          label: "Cadastrar despesa",
          icon: "add_circle",
          variant: "primary" as const,
          onClick: () => {
            setIsCreateModalOpen(true);
          },
        },
        {
          label: "Atualizar dados",
          icon: "refresh",
          variant: "ghost" as const,
          onClick: () => {
            void refetch();
          },
        },
      ],
    }),
    [refetch]
  );

  useDashboardHeader(headerConfig);

  const activeModalDespesa = editingDespesa ?? viewingDespesa;
  const allRelations = useMemo(() => {
    return buildFinanceRelations({
      despesas: despesas.map((item) => item.raw),
      instituicoes,
      secretarias,
      orcamentos,
      tiposDespesa,
    });
  }, [despesas, instituicoes, orcamentos, secretarias, tiposDespesa]);

  const filteredRelations = useMemo(() => {
    return buildFinanceRelations({
      despesas: filteredDespesas.map((item) => item.raw),
      instituicoes,
      secretarias,
      orcamentos,
      tiposDespesa,
    });
  }, [filteredDespesas, instituicoes, orcamentos, secretarias, tiposDespesa]);

  const tipoDespesaOptions = useMemo<SelectOption[]>(() => {
    return tiposDespesa.map((tipoDespesa) => ({
      value: tipoDespesa.id,
      label: tipoDespesa.descricao,
    }));
  }, [tiposDespesa]);

  const instituicaoOptions = useMemo<SelectOption[]>(() => {
    return instituicoes.map((instituicao) => ({
      value: instituicao.id,
      label: instituicao.nome,
    }));
  }, [instituicoes]);

  const fornecedorOptions = useMemo<SelectOption[]>(() => {
    return fornecedores.map((fornecedor) => ({
      value: fornecedor.idFornecedor,
      label: fornecedor.nomeFantasia || fornecedor.nome,
    }));
  }, [fornecedores]);

  const usuarioOptions = useMemo<SelectOption[]>(() => {
    return usuarios.map((usuario) => ({
      value: usuario.id,
      label: usuario.nome,
    }));
  }, [usuarios]);

  const orcamentoOptions = useMemo<SelectOption[]>(() => {
    return orcamentos.map((orcamento) => {
      const ano = orcamento.anoOrcamento ?? orcamento.ano;
      const valor = orcamento.valorOrcamento ?? orcamento.valor ?? 0;

      return {
        value: orcamento.idOrcamento,
        label: `#${String(orcamento.idOrcamento).padStart(3, "0")} - ${ano} - ${formatCurrency(
          Number(valor)
        )}`,
      };
    });
  }, [orcamentos]);

  const resolvedTipoDespesaOptions = useMemo(() => {
    return ensureOption(
      tipoDespesaOptions,
      activeModalDespesa?.raw.idTipoDespesa,
      activeModalDespesa?.categoria ?? "Tipo atual"
    );
  }, [activeModalDespesa, tipoDespesaOptions]);

  const resolvedInstituicaoOptions = useMemo(() => {
    return ensureOption(
      instituicaoOptions,
      activeModalDespesa?.raw.idInstituicao,
      activeModalDespesa?.raw.idInstituicao
        ? `Instituicao #${activeModalDespesa.raw.idInstituicao}`
        : "Instituicao atual"
    );
  }, [activeModalDespesa, instituicaoOptions]);

  const resolvedOrcamentoOptions = useMemo(() => {
    return ensureOption(
      orcamentoOptions,
      activeModalDespesa?.raw.idOrcamento,
      activeModalDespesa?.raw.idOrcamento
        ? `Orcamento #${activeModalDespesa.raw.idOrcamento}`
        : "Orcamento atual"
    );
  }, [activeModalDespesa, orcamentoOptions]);

  const resolvedFornecedorOptions = useMemo(() => {
    return ensureOption(
      fornecedorOptions,
      activeModalDespesa?.raw.idFornecedor ?? activeModalDespesa?.raw.fornecedorId,
      activeModalDespesa?.raw.idFornecedor
        ? `Fornecedor #${activeModalDespesa.raw.idFornecedor}`
        : "Fornecedor atual"
    );
  }, [activeModalDespesa, fornecedorOptions]);

  const resolvedUsuarioOptions = useMemo(() => {
    return ensureOption(
      usuarioOptions,
      activeModalDespesa?.raw.idUsuario,
      activeModalDespesa?.raw.idUsuario
        ? `Usuario #${activeModalDespesa.raw.idUsuario}`
        : "Usuario atual"
    );
  }, [activeModalDespesa, usuarioOptions]);

  const resolveTipoDespesa = (value: unknown) => {
    const tipoDespesaId = Number(value);
    return tiposDespesa.find((tipoDespesa) => tipoDespesa.id === tipoDespesaId);
  };

  const despesaFormFields = useMemo<ModalFieldConfig[]>(() => {
    return [
      { key: "id", hidden: true },
      {
        key: "numeroDocumento",
        label: "Numero do documento",
        placeholder: "Somente numeros",
        mask: "integer",
        required: true,
        validate: (value) => {
          const normalizedValue = digitsOnly(value);

          if (!normalizedValue) {
            return "Numero do documento deve conter apenas numeros.";
          }

          if (normalizedValue.length > 100) {
            return "Numero do documento deve ter no maximo 100 caracteres.";
          }

          return undefined;
        },
      },
      {
        key: "codigo",
        label: "Codigo de agrupamento",
        placeholder: "RENAVAM, patrimonio, contrato...",
      },
      {
        key: "idTipoDespesa",
        label: "Categoria",
        placeholder: "Selecione um tipo de despesa",
        type: "select",
        required: true,
        options: resolvedTipoDespesaOptions,
        validate: (value) => {
          if (toPositiveNumber(value) <= 0) {
            return "Selecione um tipo de despesa valido.";
          }

          return undefined;
        },
      },
      {
        key: "uc",
        label: "UC",
        placeholder: "Informe a unidade consumidora",
        validate: (value, formData) => {
          const tipoDespesa = resolveTipoDespesa(formData.idTipoDespesa);
          return validateRequiredUc(value, tipoDespesa?.solicitaUc === 1);
        },
      },
      {
        key: "consumoPrevisto",
        label: "Valor",
        placeholder: "0,00",
        type: "number",
        mask: "currency",
        required: true,
        validate: (value) => {
          const numericValue = Number(value);

          if (Number.isNaN(numericValue) || numericValue < 0) {
            return "Valor da despesa nao pode ser negativo.";
          }

          return undefined;
        },
      },
      {
        key: "dataEmicao",
        label: "Data de emissao",
        type: "date",
        required: true,
        validate: (value, formData) => {
          const normalizedDate = normalizeDateInput(value);
          if (!normalizedDate) {
            return "Data de emissao invalida.";
          }

          return validateDespesaDateRange(normalizedDate, formData.dataVencimento);
        },
      },
      {
        key: "dataVencimento",
        label: "Data de vencimento",
        type: "date",
        required: true,
        validate: (value, formData) => {
          const normalizedDate = normalizeDateInput(value);
          if (!normalizedDate) {
            return "Data de vencimento invalida.";
          }

          return validateDespesaDateRange(formData.dataEmicao, normalizedDate);
        },
      },
      {
        key: "idInstituicao",
        label: "Instituicao",
        placeholder: "Selecione a instituicao",
        type: "select",
        required: true,
        options: resolvedInstituicaoOptions,
        validate: (value) => {
          if (toPositiveNumber(value) <= 0) {
            return "Selecione uma instituicao valida.";
          }

          return undefined;
        },
      },
      {
        key: "idOrcamento",
        label: "Orcamento",
        placeholder: "Selecione o orcamento",
        type: "select",
        required: true,
        options: resolvedOrcamentoOptions,
        validate: (value) => {
          if (toPositiveNumber(value) <= 0) {
            return "Selecione um orcamento valido.";
          }

          return undefined;
        },
      },
      {
        key: "idFornecedor",
        label: "Fornecedor",
        placeholder: "Selecione o fornecedor",
        type: "select",
        required: true,
        options: resolvedFornecedorOptions,
        validate: (value) => {
          if (toPositiveNumber(value) <= 0) {
            return "Selecione um fornecedor valido.";
          }

          return undefined;
        },
      },
      {
        key: "idUsuario",
        label: "Usuario responsavel",
        placeholder: "Selecione o usuario",
        type: "select",
        required: true,
        options: resolvedUsuarioOptions,
        validate: (value) => {
          if (toPositiveNumber(value) <= 0) {
            return "Selecione um usuario valido.";
          }

          return undefined;
        },
      },
      {
        key: "situacao",
        label: "Status financeiro",
        placeholder: "Selecione o status",
        type: "select",
        required: true,
        options: STATUS_OPTIONS,
      },
    ];
  }, [
    resolvedFornecedorOptions,
    resolvedInstituicaoOptions,
    resolvedOrcamentoOptions,
    resolvedTipoDespesaOptions,
    resolvedUsuarioOptions,
    tiposDespesa,
  ]);

  const listResume = useMemo(() => {
    return `${filteredDespesas.length} ${
      filteredDespesas.length === 1 ? "despesa encontrada" : "despesas encontradas"
    }`;
  }, [filteredDespesas.length]);

  const panoramaMetrics = useMemo<InsightMetric[]>(() => {
    const instituicoesComGastos = filteredRelations.instituicoes.filter(
      (instituicao) => instituicao.quantidadeDespesas > 0
    ).length;
    const secretariasComGastos = filteredRelations.secretarias.filter(
      (secretaria) => secretaria.quantidadeDespesas > 0
    ).length;

    return [
      {
        label: "Codigos",
        value: String(filteredRelations.codigos.length),
        hint: "Agrupamentos ativos no recorte atual",
        tone: "teal",
      },
      {
        label: "Instituicoes",
        value: String(instituicoesComGastos),
        hint: "Com despesas no recorte filtrado",
        tone: "amber",
      },
      {
        label: "Secretarias",
        value: String(secretariasComGastos),
        hint: "Redes institucionais relacionadas",
        tone: "slate",
      },
      {
        label: "Gasto filtrado",
        value: formatCurrency(summary.saida),
        hint: "Soma financeira do painel atual",
        tone: "coral",
      },
    ];
  }, [filteredRelations.codigos.length, filteredRelations.instituicoes, filteredRelations.secretarias, summary.saida]);

  const topCodigoGroups = useMemo(() => filteredRelations.codigos.slice(0, 4), [filteredRelations.codigos]);
  const topInstituicaoGroups = useMemo(
    () =>
      filteredRelations.instituicoes
        .filter((instituicao) => instituicao.quantidadeDespesas > 0)
        .slice(0, 4),
    [filteredRelations.instituicoes]
  );
  const topSecretariaGroups = useMemo(
    () =>
      filteredRelations.secretarias
        .filter((secretaria) => secretaria.quantidadeDespesas > 0)
        .slice(0, 4),
    [filteredRelations.secretarias]
  );

  const getDespesaCodigo = (despesa: DespesaDashboardRow): string => {
    return despesa.raw.codigo?.trim() || "Sem codigo informado";
  };

  const mapDespesaToExportRow = (despesa: DespesaDashboardRow): DespesaExportRow => {
    return {
      id: despesa.id,
      codigo: getDespesaCodigo(despesa),
      categoria: despesa.categoria,
      descricao: despesa.descricao,
      valor: despesa.valorFormatado,
      data: despesa.dataFormatada,
      situacao: despesa.situacao,
    };
  };

  const filteredExportRows = useMemo(() => {
    return filteredDespesas.map(mapDespesaToExportRow);
  }, [filteredDespesas]);

  const allExportRows = useMemo(() => {
    return despesas.map(mapDespesaToExportRow);
  }, [despesas]);

  const lastUpdatedLabel = useMemo(() => {
    return formatDateTime(lastUpdatedAt);
  }, [lastUpdatedAt]);

  const handleApplyFilters = () => {
    applyFilters({
      ...filterForm,
      search: filterForm.search.trim(),
    });
  };

  const handleClearFilters = () => {
    setFilterForm(INITIAL_FILTER_FORM);
    clearFilters();
  };

  const handleCreateSubmit = async (formData: Record<string, unknown>) => {
    try {
      await createDespesa(formData);
      setIsCreateModalOpen(false);
    } catch (submitError) {
      showToast(
        submitError instanceof Error ? submitError.message : "Erro ao cadastrar despesa.",
        "error"
      );
    }
  };

  const handleEditSubmit = async (formData: Record<string, unknown>) => {
    if (!editingDespesa) return;

    try {
      await updateDespesa(editingDespesa.id, formData);
      setEditingDespesa(null);
    } catch (submitError) {
      showToast(
        submitError instanceof Error ? submitError.message : "Erro ao atualizar despesa.",
        "error"
      );
    }
  };

  const handleDelete = async (despesa: DespesaDashboardRow) => {
    const actionLabel = "remover";
    const confirmed = window.confirm(
      `Deseja ${actionLabel} a despesa ${despesa.registro} - ${despesa.descricao}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await removeDespesa(despesa.id);
    } catch (submitError) {
      showToast(
        submitError instanceof Error
          ? submitError.message
          : `Erro ao ${actionLabel} despesa.`,
        "error"
      );
    }
  };

  const handleExport = async ({ outputType, scope, selectedColumnIds }: TableExportOptions) => {
    const rows = scope === "all" ? allExportRows : filteredExportRows;
    const selectedColumns = getSelectedColumns(DESPESAS_EXPORT_COLUMNS, selectedColumnIds);

    try {
      setIsExporting(true);

      await exportTableData({
        outputType,
        title: DESPESAS_EXPORT_TITLE,
        fileName: DESPESAS_EXPORT_FILE_NAME,
        rows,
        columns: selectedColumns,
      });

      showToast("Arquivo gerado com sucesso.", "success");
      setIsExportModalOpen(false);
    } catch (error) {
      console.error("Erro ao exportar listagem de despesas.", error);
      showToast("Nao foi possivel gerar o arquivo. Tente novamente.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  if (loading && filteredDespesas.length === 0 && !error) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-7">
      <section className="despesas-hero civitas-enter relative overflow-hidden rounded-sm border border-[#E0ECEE] bg-white px-6 py-7 shadow-[0_12px_30px_rgba(0,0,0,0.05)] sm:px-8">
        <div className="despesas-hero__decor absolute -right-14 -top-16 h-40 w-40 rounded-sm bg-[#EAF5F6]" />
        <div className="despesas-hero__decor absolute bottom-0 left-0 h-20 w-40 rounded-sm bg-[#F7FBFB]" />

        <div className="relative z-10 max-w-4xl">
          <span className="inline-flex rounded-sm border border-[#D7E6E8] bg-[#F4F9F9] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#6E8A92]">
            Painel de acompanhamento
          </span>
          <h2 className="mt-3 text-[42px] font-bold leading-[0.95] text-[#0B4D57] sm:text-[56px]">
            Acompanhe despesas, aplique filtros e mantenha tudo em um unico painel.
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-[#67828A] sm:text-base">
            Visualize o resumo local, aplique filtros com mais clareza e acompanhe
            relacoes entre secretaria, instituicao e codigo sem sair da tela.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={() => listSectionRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#FF8F2B] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(255,143,43,0.28)] transition hover:brightness-95"
            >
              <span className="material-symbols-outlined !text-[18px]">arrow_downward</span>
              Ir para listagem
            </button>

            <button
              type="button"
              onClick={() => setValuesVisible((currentValue) => !currentValue)}
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-[#D6E5E8] bg-white px-5 py-3 text-sm font-semibold text-[#31505A] transition hover:bg-[#F6FAFA]"
            >
              <span className="material-symbols-outlined !text-[18px]">
                {valuesVisible ? "visibility_off" : "visibility"}
              </span>
              {valuesVisible ? "Ocultar valores" : "Mostrar valores"}
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <SummaryCard
          title="Saldo total"
          subtitle="Entrada menos saida com filtros aplicados"
          value={summary.saldoTotal}
          visible={valuesVisible}
          background="linear-gradient(135deg, #0D7A7C 0%, #38A9A6 52%, #66C7C0 100%)"
          icon="account_balance_wallet"
        />
        <SummaryCard
          title="Entrada"
          subtitle="Orcamentos compativeis com o painel"
          value={summary.entrada}
          visible={valuesVisible}
          background="linear-gradient(135deg, #1A1F28 0%, #2E3642 48%, #11161F 100%)"
          icon="south_west"
        />
        <SummaryCard
          title="Saida"
          subtitle="Total das despesas filtradas"
          value={summary.saida}
          visible={valuesVisible}
          background="linear-gradient(135deg, #FF9800 0%, #F59E0B 45%, #FFC75A 100%)"
          icon="north_east"
        />
      </section>

      <section className="civitas-surface civitas-enter space-y-5 rounded-sm p-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
            Relacoes financeiras
          </p>
          <h3 className="mt-2 text-[28px] font-semibold text-[var(--secundary-1)]">
            Agrupe despesas por secretaria, instituicao e codigo.
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--foreground-muted)]">
            O contrato do backend foi consolidado aqui para mostrar todos os gastos
            do mesmo codigo, a relacao entre secretaria e instituicao e o agrupamento
            de debitos por instituicao.
          </p>
        </div>

        <InsightsGrid metrics={panoramaMetrics} />

        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
              Secretaria x instituicao
            </p>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              Secretarias com suas instituicoes ativas no recorte atual.
            </p>

            <div className="mt-4 space-y-3">
              {topSecretariaGroups.length > 0 ? (
                topSecretariaGroups.map((secretaria) => (
                  <article
                    key={secretaria.id}
                    className="rounded-sm border border-[var(--border-soft)] bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="truncate text-base font-semibold text-[var(--foreground)]">
                          {secretaria.nome}
                        </h4>
                        <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                          {secretaria.quantidadeInstituicoesComGastos} de{" "}
                          {secretaria.quantidadeInstituicoes} instituicoes com gasto
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-[var(--secundary-1)]">
                        {secretaria.totalGastosFormatado}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {secretaria.instituicoes.slice(0, 5).map((instituicao) => (
                        <span
                          key={`${secretaria.id}-${instituicao.id}`}
                          className="rounded-sm border border-[var(--border-default)] bg-[var(--surface-subtle)] px-3 py-1 text-xs font-medium text-[var(--foreground-muted)]"
                        >
                          {instituicao.nome}
                        </span>
                      ))}
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-sm border border-dashed border-[var(--border-default)] px-4 py-8 text-center text-sm text-[var(--foreground-soft)]">
                  Nenhuma relacao secretaria x instituicao encontrada com os filtros atuais.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
              Agrupamento por codigo
            </p>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              Abra todos os gastos do mesmo codigo, mesmo quando passam por mais de uma instituicao.
            </p>

            <div className="mt-4 space-y-3">
              {topCodigoGroups.length > 0 ? (
                topCodigoGroups.map((codigo) => (
                  <article
                    key={codigo.codigoNormalizado}
                    className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="truncate text-base font-semibold text-[var(--secundary-1)]">
                          {codigo.codigo}
                        </h4>
                        <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                          {codigo.quantidadeDespesas} despesas em {codigo.quantidadeInstituicoes} instituicoes
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedCodigoGroup(codigo)}
                        className="civitas-action civitas-action--ghost rounded-sm px-4 py-2 text-sm"
                      >
                        Ver gastos
                      </button>
                    </div>
                    <p className="mt-3 text-lg font-semibold text-[var(--foreground)]">
                      {codigo.totalGastosFormatado}
                    </p>
                  </article>
                ))
              ) : (
                <div className="rounded-sm border border-dashed border-[var(--border-default)] px-4 py-8 text-center text-sm text-[var(--foreground-soft)]">
                  Nenhum codigo encontrado nas despesas filtradas.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {topInstituicaoGroups.map((instituicao) => (
            <article
              key={instituicao.id}
              className="rounded-sm border border-[var(--border-soft)] bg-[linear-gradient(180deg,var(--surface-elevated),var(--surface-subtle))] p-5 shadow-[0_18px_30px_rgba(13,28,33,0.06)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="inline-flex rounded-sm border border-[var(--border-default)] bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
                    {instituicao.secretariaNome}
                  </span>
                  <h4 className="mt-3 truncate text-lg font-semibold text-[var(--foreground)]">
                    {instituicao.nome}
                  </h4>
                  <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                    {instituicao.quantidadeDespesas} despesas em {instituicao.quantidadeCodigos} codigos
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedInstituicaoGroup(instituicao)}
                  className="civitas-action civitas-action--ghost rounded-sm px-4 py-2 text-sm"
                >
                  Ver instituicao
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-sm border border-[var(--border-soft)] bg-white p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
                    Gasto
                  </p>
                  <p className="mt-2 text-base font-semibold text-[var(--secundary-1)]">
                    {instituicao.totalGastosFormatado}
                  </p>
                </div>
                <div className="rounded-sm border border-[var(--border-soft)] bg-white p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
                    Orcamento
                  </p>
                  <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
                    {instituicao.totalOrcamentosFormatado}
                  </p>
                </div>
                <div className="rounded-sm border border-[var(--border-soft)] bg-white p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
                    Saldo
                  </p>
                  <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
                    {instituicao.saldoFormatado}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="despesas-filter-panel civitas-surface civitas-enter rounded-sm p-5 sm:p-6">
        <div className="flex flex-col gap-3 border-b border-[var(--divider)] pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--foreground-soft)]">
              <span className="material-symbols-outlined !text-[16px] text-[var(--secundary-1)]">
                tune
              </span>
              Filtros
            </div>
            <h3 className="mt-3 text-[28px] font-bold text-[var(--secundary-1)]">
              Refina visao de despesas
            </h3>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--foreground-muted)]">
              Combine periodo, categoria, status e busca textual para encontrar
              rapidamente os registros que importam. A listagem responde em tempo real
              aos dados do backend.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void refetch()}
            className="civitas-action civitas-action--ghost rounded-sm px-4 py-2.5 text-sm"
          >
            <span className="material-symbols-outlined !text-[18px]">refresh</span>
            Atualizar dados
          </button>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <Input
              value={filterForm.search}
              onChange={(event) =>
                setFilterForm((currentValue) => ({
                  ...currentValue,
                  search: event.target.value,
                }))
              }
              placeholder="Busque por codigo, documento, descricao, instituicao ou secretaria"
              className="despesas-filter-field"
            />
          </div>

          <Input
            type="date"
            value={filterForm.dataInicio}
            onChange={(event) =>
              setFilterForm((currentValue) => ({
                ...currentValue,
                dataInicio: event.target.value,
              }))
            }
            label="Inicio do periodo"
            className="despesas-filter-field"
          />

          <Input
            type="date"
            value={filterForm.dataFim}
            onChange={(event) =>
              setFilterForm((currentValue) => ({
                ...currentValue,
                dataFim: event.target.value,
              }))
            }
            label="Fim do periodo"
            className="despesas-filter-field"
          />

          <div className="space-y-2">
            <label className="despesas-filter-label block text-sm font-semibold text-[var(--foreground-muted)]">Categoria</label>
            <select
              value={filterForm.idTipoDespesa}
              onChange={(event) =>
                setFilterForm((currentValue) => ({
                  ...currentValue,
                  idTipoDespesa: event.target.value,
                }))
              }
              className={filterFieldClassName}
            >
              <option value="">Todas</option>
              {tipoDespesaOptions.map((option) => (
                <option key={`filter-category-${option.value}`} value={String(option.value)}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="despesas-filter-label block text-sm font-semibold text-[var(--foreground-muted)]">Status</label>
            <select
              value={filterForm.situacao}
              onChange={(event) =>
                setFilterForm((currentValue) => ({
                  ...currentValue,
                  situacao: event.target.value,
                }))
              }
              className={filterFieldClassName}
            >
              <option value="">Todas</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={`filter-status-${option.value}`} value={String(option.value)}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="despesas-filter-label block text-sm font-semibold text-[var(--foreground-muted)]">Solicita UC</label>
            <select
              value={filterForm.solicitaUc}
              onChange={(event) =>
                setFilterForm((currentValue) => ({
                  ...currentValue,
                  solicitaUc: event.target.value,
                }))
              }
              className={filterFieldClassName}
            >
              <option value="">Todos</option>
              {SOLICITA_UC_OPTIONS.map((option) => (
                <option key={`filter-uc-${option.value}`} value={String(option.value)}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col justify-end gap-3 sm:flex-row sm:items-end sm:justify-end">
            <button
              type="button"
              onClick={handleApplyFilters}
              className="civitas-action civitas-action--primary rounded-sm px-5 py-3 text-sm"
            >
              <span className="material-symbols-outlined !text-[18px]">filter_alt</span>
              Aplicar filtros
            </button>

            <button
              type="button"
              onClick={handleClearFilters}
              className="civitas-action civitas-action--ghost rounded-sm px-5 py-3 text-sm"
            >
              <span className="material-symbols-outlined !text-[18px]">ink_eraser</span>
              Limpar painel
            </button>
          </div>
        </div>
      </section>

      <section
        ref={listSectionRef}
        className="civitas-table-shell civitas-enter overflow-hidden rounded-sm"
      >
        <div className="border-b border-[var(--divider)] px-5 py-5 sm:px-6">
          <h3 className="text-[36px] font-bold leading-none text-[var(--secundary-1)]">
            Listagem de despesas
          </h3>
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">
            Painel com leitura rapida de categoria, valor, data, situacao e acoes
            de manutencao.
          </p>
        </div>

        {allExportRows.length > 0 ? (
          <div className="flex flex-col gap-3 border-b border-[#E4EEF0] px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-5 lg:px-6">
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="civitas-searchbar__action flex w-full items-center justify-center gap-2 rounded-sm border border-[#D5E3E6] bg-white px-5 py-2.5 font-semibold text-[#1F2A32] transition hover:bg-[#F7FAFB] sm:w-auto"
            >
              <span className="material-symbols-outlined text-base text-[#1F2A32]">print</span>
              Exportar / Imprimir
            </button>
          </div>
        ) : null}

        {error && (
          <div className="mx-5 mt-5 rounded-sm border border-[#F4C5C5] bg-[#FFF7F7] px-4 py-3 text-sm text-[#AA3A3A] sm:mx-6">
            {error}
          </div>
        )}

        <div className="overflow-x-auto px-4 py-5 sm:px-6">
          <table className="min-w-full border-separate border-spacing-y-3">
            <thead>
              <tr className="text-left text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-soft)]">
                <th className="px-4 py-2">Registro</th>
                <th className="px-4 py-2">Codigo</th>
                <th className="px-4 py-2">Categoria</th>
                <th className="px-4 py-2">Descricao</th>
                <th className="px-4 py-2">Valor</th>
                <th className="px-4 py-2">Data</th>
                <th className="px-4 py-2">Situacao</th>
                <th className="px-4 py-2 text-center">Acao</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={`loading-row-${index}`} className="rounded-sm bg-[#F8FBFB]">
                    {Array.from({ length: 8 }).map((__, cellIndex) => (
                      <td key={`loading-cell-${index}-${cellIndex}`} className="px-4 py-5">
                        <div className="h-5 animate-pulse rounded-sm bg-[#E7EFF1]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : empty ? (
                <tr>
                  <td
                    colSpan={8}
                    className="rounded-sm border border-dashed border-[#D6E5E8] px-4 py-10 text-center text-[#7B949B]"
                  >
                    Nenhuma despesa encontrada com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filteredDespesas.map((despesa, index) => (
                  <tr
                    key={despesa.id}
                    style={
                      index < 6
                        ? ({ ["--enter-delay" as string]: `${index * 45}ms` } as React.CSSProperties)
                        : undefined
                    }
                    className={`${index < 6 ? "civitas-enter " : ""}rounded-sm bg-[rgba(255,255,255,0.96)] shadow-[var(--shadow-xs)] ring-1 ring-[#E2EFF1] transition-all duration-[var(--motion-duration-fast)] hover:-translate-y-[1px] hover:bg-[#FCFEFE] hover:shadow-[var(--shadow-sm)]`}
                  >
                    <td className="rounded-sm px-4 py-5">
                      <span className="inline-flex min-w-[84px] items-center justify-center rounded-sm border border-[#E3CB73] bg-[linear-gradient(135deg,#FFE38A_0%,#F7D447_100%)] px-4 py-2 text-sm font-bold text-[#272727] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
                        {despesa.registro}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-sm font-semibold text-[var(--secundary-1)]">
                      {getDespesaCodigo(despesa)}
                    </td>
                    <td className="px-4 py-5 text-sm font-semibold text-[var(--foreground)]">
                      {despesa.categoria}
                    </td>
                    <td className="px-4 py-5 text-sm text-[var(--foreground-muted)]">{despesa.descricao}</td>
                    <td className="px-4 py-5 text-sm font-semibold text-[var(--secundary-1)]">
                      {despesa.valorFormatado}
                    </td>
                    <td className="px-4 py-5 text-sm text-[var(--foreground-muted)]">{despesa.dataFormatada}</td>
                    <td className="px-4 py-5">
                      <span
                        className={`civitas-badge min-w-[84px] ${getStatusBadgeClassName(
                          despesa.situacao
                        )}`}
                      >
                        {despesa.situacaoLabel}
                      </span>
                    </td>
                    <td className="rounded-sm px-4 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setViewingDespesa(despesa)}
                          className={iconButtonClassName}
                          aria-label={`Visualizar ${despesa.registro}`}
                        >
                          <span className="material-symbols-outlined !text-[18px]">
                            visibility
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingDespesa(despesa)}
                          className={iconButtonClassName}
                          aria-label={`Editar ${despesa.registro}`}
                        >
                          <span className="material-symbols-outlined !text-[18px]">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(despesa)}
                          className="flex h-9 w-9 items-center justify-center rounded-sm border border-[#F1D8D8] bg-[rgba(255,255,255,0.92)] text-[#D16565] shadow-[var(--shadow-xs)] transition-all duration-[var(--motion-duration-fast)] hover:-translate-y-[1px] hover:bg-[#FFF4F4] hover:shadow-[var(--shadow-sm)]"
                          aria-label={`Remover ${despesa.registro}`}
                        >
                          <span className="material-symbols-outlined !text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-2 border-t border-[var(--divider)] bg-[linear-gradient(180deg,rgba(247,251,251,0.96)_0%,rgba(243,248,248,0.96)_100%)] px-5 py-4 text-sm text-[var(--foreground-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>{listResume}</span>
          <span>Ultima atualizacao: {lastUpdatedLabel}</span>
        </div>
      </section>

      {isCreateModalOpen ? (
        <Modal value={isCreateModalOpen} setValue={setIsCreateModalOpen}>
          <Form
            object={EMPTY_DESPESA_FORM}
            name="despesa"
            type="create"
            fields={despesaFormFields}
            onCancel={() => setIsCreateModalOpen(false)}
            onConfirm={handleCreateSubmit}
          />
        </Modal>
      ) : null}

      {editingDespesa && (
        <Modal value={true} setValue={() => setEditingDespesa(null)}>
          <Form
            object={buildDespesaFormObject(editingDespesa)}
            name="despesa"
            type="edit"
            fields={despesaFormFields}
            onCancel={() => setEditingDespesa(null)}
            onConfirm={handleEditSubmit}
          />
        </Modal>
      )}

      {viewingDespesa && (
        <Modal value={true} setValue={() => setViewingDespesa(null)}>
          <Form
            object={buildDespesaFormObject(viewingDespesa)}
            name="despesa"
            type="view"
            fields={despesaFormFields}
            onCancel={() => setViewingDespesa(null)}
          />
        </Modal>
      )}

      <InsightsModal
        open={selectedCodigoGroup !== null}
        onClose={() => setSelectedCodigoGroup(null)}
        title={selectedCodigoGroup?.codigo ?? ""}
        subtitle="Todas as despesas do mesmo codigo, incluindo distribuicao por instituicao e secretaria."
        metrics={
          selectedCodigoGroup
            ? [
                {
                  label: "Gasto total",
                  value: selectedCodigoGroup.totalGastosFormatado,
                  hint: "Soma de todas as despesas do codigo",
                  tone: "teal",
                },
                {
                  label: "Despesas",
                  value: String(selectedCodigoGroup.quantidadeDespesas),
                  hint: "Lancamentos vinculados ao codigo",
                  tone: "amber",
                },
                {
                  label: "Instituicoes",
                  value: String(selectedCodigoGroup.quantidadeInstituicoes),
                  hint: "Distribuicao institucional",
                  tone: "slate",
                },
                {
                  label: "Secretarias",
                  value: String(selectedCodigoGroup.quantidadeSecretarias),
                  hint: `Ultima referencia em ${selectedCodigoGroup.ultimaReferenciaFormatada}`,
                  tone: "coral",
                },
              ]
            : []
        }
      >
        <DespesasRelacionadasTable
          despesas={selectedCodigoGroup?.despesas ?? []}
          emptyMessage="Nenhuma despesa encontrada para este codigo."
        />
      </InsightsModal>

      <InsightsModal
        open={selectedInstituicaoGroup !== null}
        onClose={() => setSelectedInstituicaoGroup(null)}
        title={selectedInstituicaoGroup?.nome ?? ""}
        subtitle={`Agrupamento de debitos por instituicao, com codigos consolidados e relacao direta com a secretaria ${selectedInstituicaoGroup?.secretariaNome ?? ""}.`}
        metrics={
          selectedInstituicaoGroup
            ? [
                {
                  label: "Gasto",
                  value: selectedInstituicaoGroup.totalGastosFormatado,
                  hint: "Total das despesas da instituicao",
                  tone: "teal",
                },
                {
                  label: "Orcamento",
                  value: selectedInstituicaoGroup.totalOrcamentosFormatado,
                  hint: "Orcamentos vinculados a instituicao",
                  tone: "slate",
                },
                {
                  label: "Saldo",
                  value: selectedInstituicaoGroup.saldoFormatado,
                  hint: "Balanca da instituicao",
                  tone: "amber",
                },
                {
                  label: "Codigos",
                  value: String(selectedInstituicaoGroup.quantidadeCodigos),
                  hint: `${selectedInstituicaoGroup.quantidadeDespesas} despesas consolidadas`,
                  tone: "coral",
                },
              ]
            : []
        }
      >
        <section className="space-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
              Codigos da instituicao
            </p>
            <h4 className="mt-1 text-lg font-semibold text-[var(--foreground)]">
              Todos os grupos de despesas da instituicao
            </h4>
          </div>

          {selectedInstituicaoGroup && selectedInstituicaoGroup.codigos.length > 0 ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {selectedInstituicaoGroup.codigos.map((codigo) => (
                <article
                  key={`${selectedInstituicaoGroup.id}-${codigo.codigoNormalizado}`}
                  className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
                        Codigo
                      </p>
                      <h5 className="mt-2 text-lg font-semibold text-[var(--secundary-1)]">
                        {codigo.codigo}
                      </h5>
                    </div>
                    <span className="rounded-sm border border-[var(--border-default)] bg-white px-3 py-1 text-xs font-semibold text-[var(--foreground-muted)]">
                      {codigo.quantidadeDespesas} despesas
                    </span>
                  </div>
                  <p className="mt-4 text-base font-semibold text-[var(--foreground)]">
                    {codigo.totalGastosFormatado}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-sm border border-dashed border-[var(--border-default)] px-4 py-8 text-center text-sm text-[var(--foreground-soft)]">
              Nenhum codigo associado a esta instituicao.
            </div>
          )}
        </section>

        <section className="space-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
              Despesas da instituicao
            </p>
            <h4 className="mt-1 text-lg font-semibold text-[var(--foreground)]">
              Lista completa das despesas agrupadas
            </h4>
          </div>

          <DespesasRelacionadasTable
            despesas={selectedInstituicaoGroup?.despesas ?? []}
            emptyMessage="Nenhuma despesa encontrada para esta instituicao."
            showInstituicao={false}
          />
        </section>
      </InsightsModal>

      {allExportRows.length > 0 ? (
        <ExportModal
          open={isExportModalOpen}
          title={DESPESAS_EXPORT_TITLE}
          columns={DESPESAS_EXPORT_COLUMNS}
          filteredCount={filteredExportRows.length}
          allCount={allExportRows.length}
          isGenerating={isExporting}
          onClose={() => setIsExportModalOpen(false)}
          onGenerate={handleExport}
        />
      ) : null}
    </div>
  );
}



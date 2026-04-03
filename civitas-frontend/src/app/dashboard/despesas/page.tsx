"use client";

import React, { useMemo, useRef, useState } from "react";
import Form, { type FieldConfig as ModalFieldConfig } from "@/components/Form/form";
import Input from "@/components/Input";
import Modal from "@/components/modal";
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

type SelectOption = {
  value: string | number;
  label: string;
};

const SOLICITA_UC_OPTIONS: SelectOption[] = [
  { value: "1", label: "Sim" },
  { value: "2", label: "Nao" },
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
  "w-full rounded-[18px] border border-[#D7E5E8] bg-[#F6FAFA] px-4 py-3 text-sm text-[#23404A] outline-none transition focus:border-[#0D6A74] focus:ring-4 focus:ring-[#0D6A74]/15";

const iconButtonClassName =
  "flex h-9 w-9 items-center justify-center rounded-full border border-[#D7E5E8] bg-white text-[#0D6A74] transition hover:bg-[#F3FAFA]";

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
    idTipoDespesa: despesa.raw.idTipoDespesa ?? "",
    uc: despesa.raw.uc ?? "",
    consumoPrevisto: despesa.raw.consumoPrevisto ?? despesa.raw.valor ?? "",
    dataEmicao:
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
    situacao: despesa.raw.situacao ?? SITUACAO_ATIVO,
  };
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
      className="relative overflow-hidden rounded-[24px] p-5 text-white shadow-[0_18px_32px_rgba(0,0,0,0.10)]"
      style={{ background }}
    >
      <div className="absolute -right-10 -top-8 h-28 w-28 rounded-full border border-white/20" />
      <div className="absolute bottom-0 right-8 h-16 w-16 rounded-full bg-white/10 blur-sm" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.08em] text-white/70">
            Conta digital
          </p>
          <h2 className="mt-4 text-[30px] font-semibold leading-none">{title}</h2>
          <p className="mt-2 text-sm text-white/75">{subtitle}</p>
        </div>

        <span className="material-symbols-outlined !text-[38px] text-white/70">
          {icon}
        </span>
      </div>

      <div className="relative z-10 mt-5 rounded-[18px] bg-black/20 px-4 py-3 backdrop-blur-sm">
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
            className="h-[180px] animate-pulse rounded-[24px] bg-[#E7EFF1]"
          />
        ))}
      </div>

      <div className="h-[240px] animate-pulse rounded-[28px] bg-[#EEF5F6]" />
      <div className="h-[360px] animate-pulse rounded-[28px] bg-[#EEF5F6]" />
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

  const {
    filteredDespesas,
    tiposDespesa,
    orcamentos,
    instituicoes,
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

  const activeModalDespesa = editingDespesa ?? viewingDespesa;

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
        label: "Situacao",
        placeholder: "Selecione a situacao",
        type: "select",
        required: true,
        options: SITUACAO_OPTIONS,
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
    const actionLabel = despesa.situacao === SITUACAO_ATIVO ? "inativar" : "reativar";
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

  if (loading && filteredDespesas.length === 0 && !error) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-[32px] border border-[#E0ECEE] bg-white px-6 py-7 shadow-[0_12px_30px_rgba(0,0,0,0.05)] sm:px-8">
        <div className="absolute -right-14 -top-16 h-40 w-40 rounded-full bg-[#EAF5F6]" />
        <div className="absolute bottom-0 left-0 h-20 w-40 rounded-tr-[80px] bg-[#F7FBFB]" />

        <div className="relative z-10 max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7B949B]">
            Home &gt; Cadastros &gt; Listagem
          </p>
          <h2 className="mt-3 text-[42px] font-bold leading-[0.95] text-[#0B4D57] sm:text-[56px]">
            Acompanhe despesas, aplique filtros e mantenha tudo em um unico painel.
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-[#67828A] sm:text-base">
            Visualize o resumo local, aplique filtros com mais clareza e gerencie os
            registros de despesas com integracao real ao backend.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0D6A74] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(13,106,116,0.28)] transition hover:brightness-95"
            >
              <span className="material-symbols-outlined !text-[18px]">add_circle</span>
              Cadastrar despesa
            </button>

            <button
              type="button"
              onClick={() => listSectionRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF8F2B] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(255,143,43,0.28)] transition hover:brightness-95"
            >
              <span className="material-symbols-outlined !text-[18px]">arrow_downward</span>
              Ir para listagem
            </button>

            <button
              type="button"
              onClick={() => setValuesVisible((currentValue) => !currentValue)}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D6E5E8] bg-white px-5 py-3 text-sm font-semibold text-[#31505A] transition hover:bg-[#F6FAFA]"
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

      <section className="rounded-[30px] border border-[#E0ECEE] bg-white p-5 shadow-[0_12px_30px_rgba(0,0,0,0.05)] sm:p-6">
        <div className="flex flex-col gap-3 border-b border-[#E8F0F1] pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D6E5E8] bg-[#F5FAFA] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6F8790]">
              <span className="material-symbols-outlined !text-[16px] text-[#0D6A74]">
                tune
              </span>
              Filtros
            </div>
            <h3 className="mt-3 text-[28px] font-bold text-[#0B4D57]">
              Refina visao de despesas
            </h3>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-[#71868D]">
              Combine periodo, categoria, status e busca textual para encontrar
              rapidamente os registros que importam. A listagem responde em tempo real
              aos dados do backend.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void refetch()}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D6E5E8] bg-white px-4 py-2.5 text-sm font-semibold text-[#31505A] transition hover:bg-[#F6FAFA]"
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
              placeholder="Busque por descricao, categoria ou ID"
              className="!mb-0 !rounded-[18px] !border-[#D7E5E8] !bg-[#F6FAFA] !px-4 !py-3 shadow-none"
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
            className="!mb-0 !rounded-[18px] !border-[#D7E5E8] !bg-[#F6FAFA] !px-4 !py-3 shadow-none"
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
            className="!mb-0 !rounded-[18px] !border-[#D7E5E8] !bg-[#F6FAFA] !px-4 !py-3 shadow-none"
          />

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#4D5A63]">Categoria</label>
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
            <label className="block text-sm font-semibold text-[#4D5A63]">Situacao</label>
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
              {SITUACAO_OPTIONS.map((option) => (
                <option key={`filter-status-${option.value}`} value={String(option.value)}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#4D5A63]">Solicita UC</label>
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
              className="inline-flex items-center justify-center gap-2 rounded-[18px] bg-[#0D6A74] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(13,106,116,0.24)] transition hover:brightness-95"
            >
              <span className="material-symbols-outlined !text-[18px]">filter_alt</span>
              Aplicar filtros
            </button>

            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center justify-center gap-2 rounded-[18px] border border-[#D6E5E8] bg-white px-5 py-3 text-sm font-semibold text-[#31505A] transition hover:bg-[#F6FAFA]"
            >
              <span className="material-symbols-outlined !text-[18px]">ink_eraser</span>
              Limpar painel
            </button>
          </div>
        </div>
      </section>

      <section
        ref={listSectionRef}
        className="overflow-hidden rounded-[30px] border border-[#E0ECEE] bg-white shadow-[0_12px_30px_rgba(0,0,0,0.05)]"
      >
        <div className="border-b border-[#E8F0F1] px-5 py-5 sm:px-6">
          <h3 className="text-[36px] font-bold leading-none text-[#0B4D57]">
            Listagem de despesas
          </h3>
          <p className="mt-2 text-sm text-[#71868D]">
            Painel com leitura rapida de categoria, valor, data, situacao e acoes
            de manutencao.
          </p>
        </div>

        {error && (
          <div className="mx-5 mt-5 rounded-[20px] border border-[#F4C5C5] bg-[#FFF3F3] px-4 py-3 text-sm text-[#AA3A3A] sm:mx-6">
            {error}
          </div>
        )}

        <div className="overflow-x-auto px-4 py-5 sm:px-6">
          <table className="min-w-full border-separate border-spacing-y-3">
            <thead>
              <tr className="text-left text-[12px] font-semibold uppercase tracking-[0.08em] text-[#90A2A8]">
                <th className="px-4 py-2">Registro</th>
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
                  <tr key={`loading-row-${index}`} className="rounded-[20px] bg-[#F8FBFB]">
                    {Array.from({ length: 7 }).map((__, cellIndex) => (
                      <td key={`loading-cell-${index}-${cellIndex}`} className="px-4 py-5">
                        <div className="h-5 animate-pulse rounded-full bg-[#E7EFF1]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : empty ? (
                <tr>
                  <td
                    colSpan={7}
                    className="rounded-[20px] border border-dashed border-[#D6E5E8] px-4 py-10 text-center text-[#7B949B]"
                  >
                    Nenhuma despesa encontrada com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filteredDespesas.map((despesa) => (
                  <tr
                    key={despesa.id}
                    className="rounded-[22px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.04)] ring-1 ring-[#E2EFF1]"
                  >
                    <td className="rounded-l-[22px] px-4 py-5">
                      <span className="inline-flex min-w-[84px] items-center justify-center rounded-full bg-[#F7D447] px-4 py-2 text-sm font-bold text-[#272727]">
                        {despesa.registro}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-sm font-semibold text-[#34464D]">
                      {despesa.categoria}
                    </td>
                    <td className="px-4 py-5 text-sm text-[#4F646C]">{despesa.descricao}</td>
                    <td className="px-4 py-5 text-sm font-semibold text-[#204C58]">
                      {despesa.valorFormatado}
                    </td>
                    <td className="px-4 py-5 text-sm text-[#4F646C]">{despesa.dataFormatada}</td>
                    <td className="px-4 py-5">
                      <span
                        className={`inline-flex min-w-[78px] items-center justify-center rounded-full px-3 py-1.5 text-xs font-bold ${
                          despesa.situacao === 1
                            ? "bg-[#FFE39A] text-[#8C5A00]"
                            : "bg-[#FFD7D7] text-[#C64040]"
                        }`}
                      >
                        {despesa.situacaoLabel}
                      </span>
                    </td>
                    <td className="rounded-r-[22px] px-4 py-5">
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
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#F1D8D8] bg-white text-[#D16565] transition hover:bg-[#FFF4F4]"
                          aria-label={`${
                            despesa.situacao === SITUACAO_ATIVO ? "Inativar" : "Reativar"
                          } ${despesa.registro}`}
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

        <div className="flex flex-col gap-2 border-t border-[#E8F0F1] bg-[#FBFDFD] px-5 py-4 text-sm text-[#71868D] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>{listResume}</span>
          <span>Ultima atualizacao: {lastUpdatedLabel}</span>
        </div>
      </section>

      {isCreateModalOpen && (
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
      )}

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
    </div>
  );
}

"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { TableExportOptions } from "@/components/Table/export-types";
import Button from "@/components/button";
import { exportTableData, getSelectedColumns } from "@/components/Table/export-utils";
import Modal from "@/components/modal";
import { useDashboardHeader } from "@/components/dashboard/dashboard-header";
import { type DespesaDashboardRow, useDespesasDashboard } from "@/hooks/useDespesasDashboard";
import { showToast } from "@/hooks/useToast";
import { normalizeDateInput } from "@/global/formPayload";
import type {
  DespesaResponsavelOption,
  DespesaUcOption,
} from "./_components/DespesaForm";
import {
  DespesaCrudModals,
  DespesaPagamentoModal,
  DespesasExportModal,
  DespesasFiltros,
  DespesasLoadingState,
  DespesasTabela,
} from "./_components";
import {
  DESPESAS_EXPORT_COLUMNS,
  DESPESAS_EXPORT_FILE_NAME,
  DESPESAS_EXPORT_TITLE,
  INITIAL_FILTER_FORM,
} from "./despesas.constants";
import { formatCurrency } from "./despesas.utils";
import { useDespesaFormFields } from "./useDespesaFormFields";
import { useDespesasViewModel } from "./useDespesasViewModel";

export default function Page() {
  const listSectionRef = useRef<HTMLElement | null>(null);

  const [filterForm, setFilterForm] = useState(INITIAL_FILTER_FORM);
  const [listCodigoSearch, setListCodigoSearch] = useState("");
  const [listInstituicaoSearch, setListInstituicaoSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDespesa, setEditingDespesa] = useState<DespesaDashboardRow | null>(null);
  const [viewingDespesa, setViewingDespesa] = useState<DespesaDashboardRow | null>(null);
  const [paymentDespesa, setPaymentDespesa] = useState<DespesaDashboardRow | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isOverdueWarningOpen, setIsOverdueWarningOpen] = useState(false);
  const overdueWarningShownRef = useRef(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const dashboard = useDespesasDashboard();
  const activeModalDespesa = editingDespesa ?? viewingDespesa;

  const viewModel = useDespesasViewModel({
    ...dashboard,
    activeModalDespesa,
    relationsCodigoSearch: "",
    relationsInstituicaoSearch: "",
    listCodigoSearch,
    listInstituicaoSearch,
  });

  const despesaViewFields = useDespesaFormFields({
    tipoCodigos: dashboard.tipoCodigos,
    tiposDespesa: dashboard.tiposDespesa,
    resolvedTipoCodigoOptions: viewModel.resolvedTipoCodigoOptions,
    resolvedTipoDespesaOptions: viewModel.resolvedTipoDespesaOptions,
    resolvedInstituicaoOptions: viewModel.resolvedInstituicaoOptions,
    resolvedOrcamentoOptions: viewModel.resolvedOrcamentoOptions,
    resolvedFornecedorOptions: viewModel.resolvedFornecedorOptions,
    resolvedUsuarioOptions: viewModel.resolvedUsuarioOptions,
    resolvedUnidadeConsumidoraOptions: viewModel.resolvedUnidadeConsumidoraOptions,
    isOptionsLoading: dashboard.loading,
    hideDocumento: true,
  });

  const unidadeConsumidoraOptions = useMemo<DespesaUcOption[]>(() => {
    const tipoDespesaMap = new Map(
      dashboard.tiposDespesa.map((item) => [item.id, item] as const)
    );
    const unidadeMedidaMap = new Map(
      dashboard.unidadesMedida.map((item) => [item.id, item] as const)
    );
    const tipoCodigoMap = new Map(
      dashboard.tipoCodigos.map((item) => [item.id, item.nome] as const)
    );
    const instituicaoMap = new Map(
      dashboard.instituicoes.map((item) => [item.id, item.nome] as const)
    );
    const secretariaMap = new Map(
      dashboard.secretarias.map((item) => [item.idSecretaria, item.nome] as const)
    );
    const fornecedorMap = new Map(
      dashboard.fornecedores.map(
        (item) => [item.idFornecedor, item.nomeFantasia || item.nome] as const
      )
    );
    const orcamentoMap = new Map(
      dashboard.orcamentos.map((item) => {
        const ano = item.anoOrcamento ?? item.ano;
        return [item.idOrcamento, `#${String(item.idOrcamento).padStart(3, "0")} - ${ano}`] as const;
      })
    );

    return dashboard.unidadesConsumidoras.map((item) => {
      const tipoDespesa = tipoDespesaMap.get(item.idTipoDespesa);
      const unidadeMedida = unidadeMedidaMap.get(tipoDespesa?.idUnidadeMedida ?? 0);

      return {
        id: item.id,
        identificador: item.identificador,
        idInstituicao: item.idInstituicao,
        instituicaoNome:
          instituicaoMap.get(item.idInstituicao) ?? `Instituicao #${item.idInstituicao}`,
        idSecretaria: item.idSecretaria,
        secretariaNome:
          secretariaMap.get(item.idSecretaria) ?? `Secretaria #${item.idSecretaria}`,
        idTipoCodigo: tipoDespesa?.idTipoCodigo ?? null,
        tipoCodigoNome:
          tipoCodigoMap.get(tipoDespesa?.idTipoCodigo ?? 0) ??
          "Tipo nao informado",
        idTipoDespesa: item.idTipoDespesa,
        tipoDespesaNome:
          tipoDespesa?.descricao ?? `Tipo #${item.idTipoDespesa}`,
        idUnidadeMedida: tipoDespesa?.idUnidadeMedida ?? null,
        unidadeMedidaNome:
          unidadeMedida?.abreviatura?.trim() ||
          unidadeMedida?.descricao?.trim() ||
          "unidade",
        idFornecedor: item.idFornecedor,
        fornecedorNome:
          fornecedorMap.get(item.idFornecedor) ?? `Fornecedor #${item.idFornecedor}`,
        idOrcamento: item.idOrcamento,
        orcamentoLabel:
          orcamentoMap.get(item.idOrcamento) ??
          `#${String(item.idOrcamento).padStart(3, "0")}`,
      };
    });
  }, [
    dashboard.fornecedores,
    dashboard.instituicoes,
    dashboard.orcamentos,
    dashboard.secretarias,
    dashboard.tipoCodigos,
    dashboard.tiposDespesa,
    dashboard.unidadesConsumidoras,
    dashboard.unidadesMedida,
  ]);

  const paymentUnidadeMedidaNome = useMemo(() => {
    if (!paymentDespesa?.raw.idUnidadeConsumidora) return undefined;

    return unidadeConsumidoraOptions.find(
      (item) => item.id === paymentDespesa.raw.idUnidadeConsumidora
    )?.unidadeMedidaNome;
  }, [paymentDespesa, unidadeConsumidoraOptions]);

  const usuarioOptions = useMemo<DespesaResponsavelOption[]>(
    () =>
      dashboard.usuarios.map((usuario) => ({
        value: usuario.id,
        label: usuario.nome,
      })),
    [dashboard.usuarios]
  );

  const headerConfig = useMemo(
    () => ({
      title: "Despesas",
      eyebrow: "Operacao",
      subtitle:
        "Tela operacional para filtrar, cadastrar, editar e exportar despesas sem paineis paralelos.",
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
          onClick: () => setIsCreateModalOpen(true),
        },
        {
          label: "Atualizar dados",
          icon: "refresh",
          variant: "ghost" as const,
          onClick: () => {
            void dashboard.refetch();
          },
        },
      ],
    }),
    [dashboard]
  );

  useDashboardHeader(headerConfig);

  const handleApplyFilters = () => {
    dashboard.applyFilters({
      ...filterForm,
      search: filterForm.search.trim(),
    });
  };

  const handleClearFilters = () => {
    setFilterForm(INITIAL_FILTER_FORM);
    dashboard.clearFilters();
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      dashboard.applyFilters({
        ...filterForm,
        search: filterForm.search.trim(),
      });
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [dashboard.applyFilters, filterForm]);

  const handleCreateSubmit = async (formData: Record<string, unknown>) => {
    try {
      await dashboard.createDespesa(formData);
      setIsCreateModalOpen(false);
    } catch (submitError) {
      showToast(getSubmitErrorMessage(submitError, "Erro ao cadastrar despesa."), "error");
    }
  };

  const handleEditSubmit = async (formData: Record<string, unknown>) => {
    if (!editingDespesa) return;

    try {
      await dashboard.updateDespesa(editingDespesa.id, formData);
      setEditingDespesa(null);
    } catch (submitError) {
      showToast(getSubmitErrorMessage(submitError, "Erro ao atualizar despesa."), "error");
    }
  };

  const handleDelete = async (despesa: DespesaDashboardRow) => {
    const confirmed = window.confirm(
      `Deseja remover a despesa ${despesa.registro} - ${despesa.descricao}?`
    );
    if (!confirmed) return;

    try {
      await dashboard.removeDespesa(despesa.id);
    } catch (submitError) {
      showToast(getSubmitErrorMessage(submitError, "Erro ao remover despesa."), "error");
    }
  };

  const handleOpenPaymentModal = (despesa: DespesaDashboardRow) => {
    setPaymentDespesa(despesa);
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setPaymentDespesa(null);
  };

  // Modal de pagamento mapeia apenas valores pagos + comprovante para o fluxo dedicado.
  const handlePaymentSubmit = async (values: {
    valorPago: number | "";
    consumoReal: number | "";
    documento: unknown;
  }) => {
    if (!paymentDespesa) return;

    try {
      await dashboard.updateDespesaPagamento(paymentDespesa.id, {
        valorPago: values.valorPago === "" ? 0 : Number(values.valorPago),
        consumoReal: values.consumoReal === "" ? 0 : Number(values.consumoReal),
        documento: values.documento,
      });
      handleClosePaymentModal();
    } catch (submitError) {
      showToast(getSubmitErrorMessage(submitError, "Erro ao atualizar pagamento."), "error");
    }
  };

  const handleExport = async ({ outputType, scope, selectedColumnIds }: TableExportOptions) => {
    const rows = scope === "all" ? viewModel.allExportRows : viewModel.filteredExportRows;
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

  const overdueDespesas = useMemo(
    () => dashboard.despesas.filter(isDespesaOverdueForWarning),
    [dashboard.despesas]
  );
  const overdueTotal = useMemo(
    () => overdueDespesas.reduce((total, despesa) => total + despesa.valor, 0),
    [overdueDespesas]
  );
  const hasOverdue = overdueDespesas.length > 0;

  const handleShowOverdueDespesas = () => {
    const overdueFilter = {
      ...INITIAL_FILTER_FORM,
      vencimento: "atrasadas",
    };

    setFilterForm(overdueFilter);
    dashboard.applyFilters(overdueFilter);
    setIsOverdueWarningOpen(false);

    window.requestAnimationFrame(() => {
      listSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  useEffect(() => {
    if (dashboard.loading || overdueWarningShownRef.current) return;
    overdueWarningShownRef.current = true;
    if (hasOverdue) {
      setIsOverdueWarningOpen(true);
    }
  }, [dashboard.loading, hasOverdue]);

  if (dashboard.loading && dashboard.filteredDespesas.length === 0 && !dashboard.error) {
    return <DespesasLoadingState />;
  }

  return (
    <div className="space-y-6">
      <DespesasFiltros
        filterForm={filterForm}
        setFilterForm={setFilterForm}
        tipoCodigoOptions={viewModel.tipoCodigoOptions}
        tipoDespesaOptions={viewModel.tipoDespesaOptions}
        instituicaoOptions={viewModel.instituicaoOptions}
        secretariaOptions={viewModel.secretariaOptions}
        filteredCount={dashboard.filteredDespesas.length}
        totalCount={dashboard.despesas.length}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        onRefresh={() => void dashboard.refetch()}
      />

      <DespesasTabela
        listSectionRef={listSectionRef}
        search={{
          codigoSearch: listCodigoSearch,
          setCodigoSearch: setListCodigoSearch,
          instituicaoSearch: listInstituicaoSearch,
          setInstituicaoSearch: setListInstituicaoSearch,
        }}
        tableData={{
          visibleDespesas: viewModel.visibleDespesas,
          hasLocalListSearch: viewModel.hasLocalListSearch,
          listResume: viewModel.listResume,
          lastUpdatedLabel: viewModel.lastUpdatedLabel,
        }}
        loading={dashboard.loading}
        error={dashboard.error}
        canExport={viewModel.allExportRows.length > 0}
        onOpenExport={() => setIsExportModalOpen(true)}
        onView={setViewingDespesa}
        onEdit={setEditingDespesa}
        onDelete={(despesa) => void handleDelete(despesa)}
        onPayment={handleOpenPaymentModal}
      />

      <DespesaCrudModals
        isCreateModalOpen={isCreateModalOpen}
        setIsCreateModalOpen={setIsCreateModalOpen}
        editingDespesa={editingDespesa}
        setEditingDespesa={setEditingDespesa}
        viewingDespesa={viewingDespesa}
        setViewingDespesa={setViewingDespesa}
        unidadesConsumidoras={unidadeConsumidoraOptions}
        usuarios={usuarioOptions}
        viewFields={despesaViewFields}
        onCreateSubmit={handleCreateSubmit}
        onEditSubmit={handleEditSubmit}
      />

        <DespesaPagamentoModal
          open={isPaymentModalOpen}
          despesa={paymentDespesa}
          unidadeMedidaNome={paymentUnidadeMedidaNome}
          onClose={handleClosePaymentModal}
          onConfirm={handlePaymentSubmit}
        />

      {isOverdueWarningOpen ? (
        <Modal value={isOverdueWarningOpen} setValue={setIsOverdueWarningOpen}>
          <div className="flex h-full flex-col gap-6">
            <div className="rounded-sm border border-[var(--tone-danger-border)] bg-[var(--tone-danger-bg)] p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-sm bg-[var(--surface-elevated)] text-[var(--tone-danger-text)]">
                  <span className="material-symbols-outlined !text-[28px]">
                    notification_important
                  </span>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--tone-danger-text)]">
                    Aviso automatico
                  </p>
                  <h3 className="mt-1.5 text-2xl font-semibold text-[var(--foreground)]">
                    Existem despesas vencidas
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                    Revise os lancamentos pendentes antes de continuar a rotina de
                    pagamento. O filtro de vencidas usa status atrasado e tambem
                    datas vencidas que ainda estao como a pagar.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-4">
                <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--foreground-soft)]">
                  Quantidade
                </span>
                <strong className="mt-2 block text-3xl text-[var(--secundary-1)]">
                  {overdueDespesas.length}
                </strong>
              </div>
              <div className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-4">
                <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--foreground-soft)]">
                  Valor previsto
                </span>
                <strong className="mt-2 block text-3xl text-[var(--secundary-1)]">
                  {formatCurrency(overdueTotal)}
                </strong>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-sm font-semibold text-[var(--foreground)]">
                  Primeiras despesas vencidas
                </h4>
                <span className="text-xs text-[var(--foreground-soft)]">
                  {Math.min(overdueDespesas.length, 4)} exibida
                  {Math.min(overdueDespesas.length, 4) === 1 ? "" : "s"}
                </span>
              </div>
              <ul className="divide-y divide-[var(--divider)] rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)]">
                {overdueDespesas.slice(0, 4).map((despesa) => (
                  <li
                    key={despesa.id}
                    className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <span className="text-sm font-semibold text-[var(--foreground)]">
                        {despesa.registro} - {despesa.descricao}
                      </span>
                      <p className="text-xs text-[var(--foreground-soft)]">
                        {despesa.instituicaoNome} | {despesa.secretariaNome}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="block text-sm font-semibold text-[var(--tone-danger-text)]">
                        {despesa.valorFormatado}
                      </span>
                      <span className="text-xs text-[var(--foreground-soft)]">
                        Venc.: {formatDespesaWarningDate(despesa)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setIsOverdueWarningOpen(false)}
              >
                Fechar
              </Button>
              <Button type="button" onClick={handleShowOverdueDespesas}>
                Ver despesas vencidas
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}

      <DespesasExportModal
        open={isExportModalOpen}
        filteredCount={viewModel.filteredExportRows.length}
        allCount={viewModel.allExportRows.length}
        isGenerating={isExporting}
        onClose={() => setIsExportModalOpen(false)}
        onGenerate={handleExport}
      />
    </div>
  );
}

const getSubmitErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const getDateTimestamp = (value?: string | null): number | null => {
  const normalizedDate = normalizeDateInput(value ?? undefined);
  if (!normalizedDate) return null;

  const [year, month, day] = normalizedDate.split("-").map(Number);
  const timestamp = new Date(year, month - 1, day).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
};

const getDespesaDueTimestamp = (despesa: DespesaDashboardRow): number | null => {
  return (
    getDateTimestamp(despesa.raw.dataVencimento) ??
    getDateTimestamp(despesa.raw.dataEmissao) ??
    getDateTimestamp(despesa.raw.dataEmicao) ??
    getDateTimestamp(despesa.raw.data)
  );
};

const isDespesaOverdueForWarning = (despesa: DespesaDashboardRow): boolean => {
  if (despesa.situacao === 3) return true;
  if (despesa.situacao === 2) return false;

  const dueTimestamp = getDespesaDueTimestamp(despesa);
  const todayTimestamp = getDateTimestamp(new Date().toISOString());
  if (dueTimestamp === null || todayTimestamp === null) return false;
  return dueTimestamp < todayTimestamp;
};

const formatDespesaWarningDate = (despesa: DespesaDashboardRow): string => {
  const normalizedDate =
    normalizeDateInput(despesa.raw.dataVencimento) ??
    normalizeDateInput(despesa.raw.dataEmissao) ??
    normalizeDateInput(despesa.raw.dataEmicao) ??
    normalizeDateInput(despesa.raw.data);

  if (!normalizedDate) return "Nao informado";

  const [year, month, day] = normalizedDate.split("-");
  if (!year || !month || !day) return normalizedDate;
  return `${day}/${month}/${year}`;
};

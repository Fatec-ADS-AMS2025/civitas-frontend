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
    hideDocumento: false,
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

  const hasOverdue = dashboard.despesas.some((despesa) => {
    if (despesa.situacao === 3) return true;
    if (despesa.situacao === 2) return false;
    const dueTimestamp = getDespesaDueTimestamp(despesa);
    const todayTimestamp = getDateTimestamp(new Date().toISOString());
    if (dueTimestamp === null || todayTimestamp === null) return false;
    return dueTimestamp < todayTimestamp;
  });

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
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
                Aviso automatico
              </p>
              <h3 className="mt-1.5 text-2xl font-semibold text-[var(--secundary-1)]">
                Despesas vencidas encontradas
              </h3>
              <p className="mt-2 text-sm text-[var(--foreground-muted)]">
                Existem despesas atrasadas. Revise os lancamentos pendentes de pagamento.
              </p>
            </div>
            <div className="flex justify-end">
              <Button type="button" onClick={() => setIsOverdueWarningOpen(false)}>
                Entendi
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

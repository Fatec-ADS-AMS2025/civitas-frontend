"use client";

import React, { useMemo, useRef, useState } from "react";
import { exportTableData, getSelectedColumns } from "@/components/Table/export-utils";
import type { TableExportOptions } from "@/components/Table/export-types";
import { useDashboardHeader } from "@/components/dashboard/dashboard-header";
import { showToast } from "@/hooks/useToast";
import { type DespesaDashboardRow, useDespesasDashboard } from "@/hooks/useDespesasDashboard";
import {
  DespesaCrudModals,
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
import { toPositiveNumber } from "./despesas.utils";
import type { UcItem } from "./_components/DespesaForm";

export default function Page() {
  const listSectionRef = useRef<HTMLElement | null>(null);

  const [filterForm, setFilterForm] = useState(INITIAL_FILTER_FORM);
  const [listCodigoSearch, setListCodigoSearch] = useState("");
  const [listInstituicaoSearch, setListInstituicaoSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUc, setSelectedUc] = useState<UcItem | null>(null);
  const [editingDespesa, setEditingDespesa] = useState<DespesaDashboardRow | null>(null);
  const [viewingDespesa, setViewingDespesa] = useState<DespesaDashboardRow | null>(null);
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

  const despesaFormFields = useDespesaFormFields({
    tipoCodigos: dashboard.tipoCodigos,
    tiposDespesa: dashboard.tiposDespesa,
    resolvedTipoCodigoOptions: viewModel.resolvedTipoCodigoOptions,
    resolvedTipoDespesaOptions: viewModel.resolvedTipoDespesaOptions,
    resolvedInstituicaoOptions: viewModel.resolvedInstituicaoOptions,
    resolvedOrcamentoOptions: viewModel.resolvedOrcamentoOptions,
    resolvedFornecedorOptions: viewModel.resolvedFornecedorOptions,
    resolvedUsuarioOptions: viewModel.resolvedUsuarioOptions,
  });

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

    const payload = {
      uc: selectedUc,
      valorDespesa: toPositiveNumber(formData.valorDespesa),
      consumoPrevisto: toPositiveNumber(formData.consumoPrevisto),
    };

    console.log("Despesa UC - payload", payload);
    setIsCreateModalOpen(false);
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
      />

      <DespesaCrudModals
        isCreateModalOpen={isCreateModalOpen}
        setIsCreateModalOpen={setIsCreateModalOpen}
        editingDespesa={editingDespesa}
        setEditingDespesa={setEditingDespesa}
        viewingDespesa={viewingDespesa}
        setViewingDespesa={setViewingDespesa}
        fields={despesaFormFields}
        onCreateSubmit={handleCreateSubmit}
        onEditSubmit={handleEditSubmit}
      />

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

"use client";

import React, { useMemo, useRef, useState } from "react";
import { exportTableData, getSelectedColumns } from "@/components/Table/export-utils";
import type { TableExportOptions } from "@/components/Table/export-types";
import { useDashboardHeader } from "@/components/dashboard/dashboard-header";
import { showToast } from "@/hooks/useToast";
import { type DespesaDashboardRow, useDespesasDashboard } from "@/hooks/useDespesasDashboard";
import type {
  FinanceCodigoResumo,
  FinanceInstituicaoResumo,
} from "@/lib/financeiro-relations";
import {
  DespesaCrudModals,
  DespesasExplorer,
  DespesasExportModal,
  DespesasFiltros,
  DespesasInsightsModals,
  DespesasLoadingState,
  DespesasResumo,
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
  // Excecao Sprint 16: esta page permanece acima do limite de 250 linhas porque concentra apenas a orquestracao da tela de despesas.
  // A regra de negocio, os dados derivados e a UI foram extraidos para hooks, utils e componentes especificos em _components.
  const listSectionRef = useRef<HTMLElement | null>(null);

  // Estados locais usados somente para coordenar filtros, buscas, modais e acoes da pagina.
  const [filterForm, setFilterForm] = useState(INITIAL_FILTER_FORM);
  const [isRelationsSectionOpen, setIsRelationsSectionOpen] = useState(false);
  const [relationsCodigoSearch, setRelationsCodigoSearch] = useState("");
  const [relationsInstituicaoSearch, setRelationsInstituicaoSearch] = useState("");
  const [listCodigoSearch, setListCodigoSearch] = useState("");
  const [listInstituicaoSearch, setListInstituicaoSearch] = useState("");
  const [valuesVisible, setValuesVisible] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDespesa, setEditingDespesa] = useState<DespesaDashboardRow | null>(null);
  const [viewingDespesa, setViewingDespesa] = useState<DespesaDashboardRow | null>(null);
  const [selectedCodigoGroup, setSelectedCodigoGroup] =
    useState<FinanceCodigoResumo | null>(null);
  const [selectedInstituicaoGroup, setSelectedInstituicaoGroup] =
    useState<FinanceInstituicaoResumo | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Hook principal de dados: encapsula carregamento, filtros e operacoes de CRUD do modulo.
  const dashboard = useDespesasDashboard();
  const activeModalDespesa = editingDespesa ?? viewingDespesa;

  // View model da tela: prepara listas, metricas, opcoes e linhas de exportacao sem poluir a page.
  const viewModel = useDespesasViewModel({
    ...dashboard,
    activeModalDespesa,
    relationsCodigoSearch,
    relationsInstituicaoSearch,
    listCodigoSearch,
    listInstituicaoSearch,
  });

  // Campos do formulario ficam em hook proprio para manter validacoes e opcoes reutilizaveis entre criar, editar e visualizar.
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

  // Configuracao do cabecalho do dashboard fica na page porque depende das acoes globais da rota.
  const headerConfig = useMemo(
    () => ({
      title: "Despesas",
      eyebrow: "Operacao",
      subtitle:
        "Centralize filtros, cadastro e manutencao das despesas com feedback rapido e leitura desktop consistente.",
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

  // Handlers da page coordenam estado local, hooks de dados e feedback visual sem duplicar regras nos componentes filhos.
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

  // Exportacao usa as linhas ja preparadas pelo view model para respeitar filtros e colunas selecionadas.
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

  // Durante a primeira carga, renderiza somente o skeleton para evitar tela incompleta.
  if (dashboard.loading && dashboard.filteredDespesas.length === 0 && !dashboard.error) {
    return <DespesasLoadingState />;
  }

  // A renderizacao abaixo apenas compoe secoes independentes; cada componente concentra sua propria responsabilidade visual.
  return (
    <div className="space-y-7">
      <DespesasResumo
        summary={dashboard.summary}
        valuesVisible={valuesVisible}
        onToggleValues={() => setValuesVisible((currentValue) => !currentValue)}
        onScrollToList={() => listSectionRef.current?.scrollIntoView({ behavior: "smooth" })}
      />

      <DespesasExplorer
        isOpen={isRelationsSectionOpen}
        onToggleOpen={() => setIsRelationsSectionOpen((currentValue) => !currentValue)}
        search={{
          codigoSearch: relationsCodigoSearch,
          setCodigoSearch: setRelationsCodigoSearch,
          instituicaoSearch: relationsInstituicaoSearch,
          setInstituicaoSearch: setRelationsInstituicaoSearch,
        }}
        data={{
          metrics: viewModel.panoramaMetrics,
          topCodigoGroups: viewModel.topCodigoGroups,
          topInstituicaoGroups: viewModel.topInstituicaoGroups,
          hasExplorerSearch: viewModel.hasExplorerSearch,
        }}
        onSelectCodigoGroup={setSelectedCodigoGroup}
        onSelectInstituicaoGroup={setSelectedInstituicaoGroup}
      />

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

      <DespesasInsightsModals
        selectedCodigoGroup={selectedCodigoGroup}
        setSelectedCodigoGroup={setSelectedCodigoGroup}
        selectedInstituicaoGroup={selectedInstituicaoGroup}
        setSelectedInstituicaoGroup={setSelectedInstituicaoGroup}
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

"use client";

import React, { useMemo, useRef, useState } from "react";
import type { TableExportOptions } from "@/components/Table/export-types";
import { exportTableData, getSelectedColumns } from "@/components/Table/export-utils";
import { useDashboardHeader } from "@/components/dashboard/dashboard-header";
import { type DespesaDashboardRow, useDespesasDashboard } from "@/hooks/useDespesasDashboard";
import { showToast } from "@/hooks/useToast";
import type {
  DespesaResponsavelOption,
  DespesaUcOption,
} from "./_components/DespesaForm";
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

export default function Page() {
  const listSectionRef = useRef<HTMLElement | null>(null);

  const [filterForm, setFilterForm] = useState(INITIAL_FILTER_FORM);
  const [listCodigoSearch, setListCodigoSearch] = useState("");
  const [listInstituicaoSearch, setListInstituicaoSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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

  const despesaViewFields = useDespesaFormFields({
    tipoCodigos: dashboard.tipoCodigos,
    tiposDespesa: dashboard.tiposDespesa,
    resolvedTipoCodigoOptions: viewModel.resolvedTipoCodigoOptions,
    resolvedTipoDespesaOptions: viewModel.resolvedTipoDespesaOptions,
    resolvedInstituicaoOptions: viewModel.resolvedInstituicaoOptions,
    resolvedOrcamentoOptions: viewModel.resolvedOrcamentoOptions,
    resolvedFornecedorOptions: viewModel.resolvedFornecedorOptions,
    resolvedUsuarioOptions: viewModel.resolvedUsuarioOptions,
    resolvedFluxoOptions: viewModel.resolvedFluxoOptions,
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
        unidadesConsumidoras={unidadeConsumidoraOptions}
        usuarios={usuarioOptions}
        fluxos={viewModel.resolvedFluxoOptions}
        viewFields={despesaViewFields}
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

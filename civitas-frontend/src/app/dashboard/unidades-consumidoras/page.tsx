"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
import CrudRouteSkeleton from "../_components/crud-route-skeleton";
import { normalizeUnidadeConsumidoraPayload } from "@/global/formPayload";
import { getSituacaoLabel, SITUACAO_INATIVO } from "@/global/situacao";
import { fornecedorService } from "@/hooks/fornecedor";
import type { ListQuery, PaginatedResult } from "@/hooks/generic";
import { instituicaoService } from "@/hooks/instituicao";
import { orcamentoService } from "@/hooks/orcamento";
import { secretariaService } from "@/hooks/secretaria";
import { tipoDespesaService } from "@/hooks/tipoDespesa";
import { unidadeConsumidoraService } from "@/hooks/unidadeConsumidora";
import FornecedorDTO from "@/models/fornecedor";
import InstituicaoDTO from "@/models/instituicao";
import OrcamentoDTO from "@/models/orcamento";
import SecretariaDTO from "@/models/secretaria";
import TipoDespesaDTO from "@/models/tipoDespesa";
import UnidadeConsumidoraDTO from "@/models/unidadeConsumidora";

const DEFAULT_PAGE_QUERY: Required<Pick<ListQuery, "page" | "size">> = { page: 1, size: 20 };
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const columns = [
  { id: "identificador", label: "Identificador" },
  { id: "instituicaoLabel", label: "Instituicao" },
  { id: "tipoDespesaLabel", label: "Tipo de Despesa" },
  { id: "secretariaLabel", label: "Secretaria" },
  { id: "orcamentoLabel", label: "Orcamento" },
  { id: "fornecedorLabel", label: "Fornecedor" },
  { id: "situacaoLabel", label: "Situacao", sortable: false },
];
const novaUnidadeConsumidora = { id: 0, identificador: "", idInstituicao: "", idTipoDespesa: "", idSecretaria: "", idOrcamento: "", idFornecedor: "", excluido: false, dataExclusao: "" };
// Indica quando um registro relacionado está inativo.
const toLabel = (label: string, situacao?: number) => situacao === SITUACAO_INATIVO ? `${label} (${getSituacaoLabel(situacao)})` : label;
type UnidadeConsumidoraRow = UnidadeConsumidoraDTO & { instituicaoLabel: string; tipoDespesaLabel: string; secretariaLabel: string; orcamentoLabel: string; fornecedorLabel: string; situacaoLabel: string };
type PaginationState = Pick<PaginatedResult<UnidadeConsumidoraRow>, "currentPage" | "pageSize" | "totalPages" | "totalRecords">;
type UnidadeConsumidoraLookups = {
  instituicoes: InstituicaoDTO[];
  tiposDespesa: TipoDespesaDTO[];
  secretarias: SecretariaDTO[];
  orcamentos: OrcamentoDTO[];
  fornecedores: FornecedorDTO[];
};
const emptyPagination: PaginationState = { currentPage: 1, pageSize: 20, totalPages: 0, totalRecords: 0 };
const shouldLoadPreviousPage = (pageResult: PaginatedResult<UnidadeConsumidoraRow>) => pageResult.totalRecords > 0 && pageResult.totalPages > 0 && pageResult.items.length === 0 && pageResult.currentPage > pageResult.totalPages;
const emptyLookups: UnidadeConsumidoraLookups = { instituicoes: [], tiposDespesa: [], secretarias: [], orcamentos: [], fornecedores: [] };
const toPositiveNumber = (value: unknown): number | null => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : null;
};
const hasDependentSelections = (formData: Record<string, unknown>) =>
  toPositiveNumber(formData.idInstituicao) !== null && toPositiveNumber(formData.idTipoDespesa) !== null;

export default function Page() {
  const [data, setData] = useState<UnidadeConsumidoraRow[]>([]);
  const [filteredData, setFilteredData] = useState<UnidadeConsumidoraRow[]>([]);
  const [campos, setCampos] = useState<FieldConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lookups, setLookups] = useState<UnidadeConsumidoraLookups>(emptyLookups);
  const [pagination, setPagination] = useState<PaginationState>(emptyPagination);

  const { instituicoes, tiposDespesa, secretarias, orcamentos, fornecedores } = lookups;
  const instituicaoOptions = useMemo(() => instituicoes.map((item) => ({ value: item.id, label: toLabel(item.nome, item.situacao) })), [instituicoes]);
  const tipoDespesaOptions = useMemo(() => tiposDespesa.map((item) => ({ value: item.id, label: toLabel(item.descricao, item.situacao) })), [tiposDespesa]);
  const secretariaOptions = useMemo(() => secretarias.map((item) => ({ value: item.idSecretaria, label: toLabel(item.nome, item.situacao) })), [secretarias]);
  const orcamentoOptions = useMemo(() => orcamentos.map((item) => ({ value: item.idOrcamento, label: toLabel(`Orcamento #${item.idOrcamento}`, item.situacao) })), [orcamentos]);
  const fornecedorOptions = useMemo(() => fornecedores.map((item) => ({ value: item.idFornecedor, label: toLabel(item.nomeFantasia || item.nome, item.situacao) })), [fornecedores]);
  const instituicaoMap = useMemo(() => new Map(instituicoes.map((item) => [item.id, item] as const)), [instituicoes]);

  const getSecretariaOptionsForSelection = (formData: Record<string, unknown>) => {
    if (!hasDependentSelections(formData)) return [];

    const instituicaoId = toPositiveNumber(formData.idInstituicao);
    if (!instituicaoId) return [];

    const secretariaId = instituicaoMap.get(instituicaoId)?.idSecretaria;
    if (!secretariaId) return [];

    return secretariaOptions.filter((item) => Number(item.value) === secretariaId);
  };

  const getOrcamentoOptionsForSelection = (formData: Record<string, unknown>) => {
    if (!hasDependentSelections(formData)) return [];

    const instituicaoId = toPositiveNumber(formData.idInstituicao);
    const tipoDespesaId = toPositiveNumber(formData.idTipoDespesa);
    if (!instituicaoId || !tipoDespesaId) return [];

    return orcamentoOptions.filter((item) => {
      const orcamento = orcamentos.find((entry) => entry.idOrcamento === Number(item.value));
      return orcamento?.idInstituicao === instituicaoId && orcamento?.idTipoDespesa === tipoDespesaId;
    });
  };

  const getFornecedorOptionsForSelection = (formData: Record<string, unknown>) => {
    if (!hasDependentSelections(formData)) return [];

    // Gambiarra gulosa: por regra operacional atual, o cadastro de UC precisa listar
    // todos os fornecedores existentes aqui, sem restringir pelos vinculos ja usados.
    return fornecedorOptions;
  };

  const formFields = useMemo<ModalFieldConfig[]>(() => [
    { key: "id", hidden: true },
    { key: "identificador", label: "Identificador", placeholder: "Identificador da unidade consumidora", required: true },
    { key: "idInstituicao", label: "Instituicao", placeholder: "Selecione a instituicao", type: "select", required: true, options: instituicaoOptions },
    { key: "idTipoDespesa", label: "Tipo de Despesa", placeholder: "Selecione o tipo de despesa", type: "select", required: true, options: tipoDespesaOptions },
    {
      key: "idSecretaria",
      label: "Secretaria",
      placeholder: "Selecione a secretaria",
      type: "select",
      required: true,
      resolveOptions: getSecretariaOptionsForSelection,
      resolveDisabled: (formData) => !hasDependentSelections(formData),
      clearOnDisable: true,
      clearOnInvalidOption: true,
    },
    {
      key: "idOrcamento",
      label: "Orcamento",
      placeholder: "Selecione o orcamento",
      type: "select",
      required: true,
      resolveOptions: getOrcamentoOptionsForSelection,
      resolveDisabled: (formData) => !hasDependentSelections(formData),
      clearOnDisable: true,
      clearOnInvalidOption: true,
    },
    {
      key: "idFornecedor",
      label: "Fornecedor",
      placeholder: "Selecione o fornecedor",
      type: "select",
      required: true,
      resolveOptions: getFornecedorOptionsForSelection,
      resolveDisabled: (formData) => !hasDependentSelections(formData),
      clearOnDisable: true,
      clearOnInvalidOption: true,
    },
  ], [fornecedorOptions, getFornecedorOptionsForSelection, getOrcamentoOptionsForSelection, getSecretariaOptionsForSelection, instituicaoOptions, tipoDespesaOptions]);

  // Mapeia IDs de lookups para labels legíveis na tabela.
  const mapRows = (items: UnidadeConsumidoraDTO[], lkp = lookups) => {
    const instMap = new Map(lkp.instituicoes.map((item) => [item.id, item.nome] as const));
    const tipoMap = new Map(lkp.tiposDespesa.map((item) => [item.id, item.descricao] as const));
    const secMap = new Map(lkp.secretarias.map((item) => [item.idSecretaria, item.nome] as const));
    const orcMap = new Map(lkp.orcamentos.map((item) => [item.idOrcamento, `Orcamento #${item.idOrcamento}`] as const));
    const fornMap = new Map(lkp.fornecedores.map((item) => [item.idFornecedor, item.nomeFantasia || item.nome] as const));
    return items.map((item) => ({
      ...item,
      instituicaoLabel: instMap.get(item.idInstituicao) ?? `Instituicao #${item.idInstituicao}`,
      tipoDespesaLabel: tipoMap.get(item.idTipoDespesa) ?? `Tipo #${item.idTipoDespesa}`,
      secretariaLabel: secMap.get(item.idSecretaria) ?? `Secretaria #${item.idSecretaria}`,
      orcamentoLabel: orcMap.get(item.idOrcamento) ?? `Orcamento #${item.idOrcamento}`,
      fornecedorLabel: fornMap.get(item.idFornecedor) ?? `Fornecedor #${item.idFornecedor}`,
      situacaoLabel: item.excluido ? "Inativo" : "Ativo",
    }));
  };

  // Carrega página + lookups em paralelo e mantém o estado consistente.
  const loadData = async (query: ListQuery = { page: pagination.currentPage, size: pagination.pageSize }) => {
    try {
      setLoading(true);
      const [page, inst, tipos, secs, orcs, fornecs] = await Promise.all([
        unidadeConsumidoraService.getPage(query),
        instituicaoService.getAll(),
        tipoDespesaService.getAll(),
        secretariaService.getAll(),
        orcamentoService.getAll(),
        fornecedorService.getAll(),
      ]);
      const nextLookups: UnidadeConsumidoraLookups = {
        instituicoes: inst,
        tiposDespesa: tipos,
        secretarias: secs,
        orcamentos: orcs,
        fornecedores: fornecs,
      };
      let rows = mapRows(page.items, nextLookups);
      // Se a página ficou vazia após alguma ação, volta para a última disponível.
      if (shouldLoadPreviousPage({ ...page, items: rows })) {
        const resolvedPage = await unidadeConsumidoraService.getPage({ ...query, page: page.totalPages });
        rows = mapRows(resolvedPage.items, nextLookups);
        setPagination({ currentPage: resolvedPage.currentPage, pageSize: resolvedPage.pageSize, totalPages: resolvedPage.totalPages, totalRecords: resolvedPage.totalRecords });
      } else {
        setPagination({ currentPage: page.currentPage, pageSize: page.pageSize, totalPages: page.totalPages, totalRecords: page.totalRecords });
      }
      setLookups(nextLookups);
      setData(rows);
      setFilteredData(rows);
      setError(null);
    } catch (err) {
      console.error("Erro ao carregar unidades consumidoras:", err);
      setData([]);
      setFilteredData([]);
      setPagination(emptyPagination);
      setError("Nao foi possivel carregar as unidades consumidoras. Verifique o backend e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCampos([
      { key: "identificador", placeholder: "Identificador", local: "principal" },
      { key: "idInstituicao", placeholder: "Instituicao", local: "filtro", type: "select", options: instituicaoOptions },
      { key: "idTipoDespesa", placeholder: "Tipo de Despesa", local: "filtro", type: "select", options: tipoDespesaOptions },
      { key: "idSecretaria", placeholder: "Secretaria", local: "filtro", type: "select", options: secretariaOptions },
      { key: "idOrcamento", placeholder: "Orcamento", local: "filtro", type: "select", options: orcamentoOptions },
      { key: "idFornecedor", placeholder: "Fornecedor", local: "filtro", type: "select", options: fornecedorOptions },
    ]);
  }, [fornecedorOptions, instituicaoOptions, orcamentoOptions, secretariaOptions, tipoDespesaOptions]);

  useEffect(() => {
    void loadData(DEFAULT_PAGE_QUERY);
  }, []);

  // Fluxo CRUD com recarga da página atual.
  const handleCreate = async (payload: Omit<UnidadeConsumidoraDTO, "id" | "excluido" | "dataExclusao">) => {
    await unidadeConsumidoraService.create(normalizeUnidadeConsumidoraPayload(payload));
    await loadData({ page: pagination.currentPage, size: pagination.pageSize });
  };
  const handleUpdate = async (id: number, payload: Partial<UnidadeConsumidoraDTO>) => {
    await unidadeConsumidoraService.update(id, normalizeUnidadeConsumidoraPayload(payload));
    await loadData({ page: pagination.currentPage, size: pagination.pageSize });
  };
  const handleDelete = async (id: number) => {
    await unidadeConsumidoraService.toggleStatusExclusao(id);
    await loadData({ page: pagination.currentPage, size: pagination.pageSize });
  };
  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage === pagination.currentPage) return;
    void loadData({ page: nextPage, size: pagination.pageSize });
  };
  const handlePageSizeChange = (nextSize: number) => {
    if (nextSize < 1 || nextSize === pagination.pageSize) return;
    void loadData({ page: DEFAULT_PAGE_QUERY.page, size: nextSize });
  };

  if (loading) return <CrudRouteSkeleton columns={8} filters={7} rows={6} />;

  return (
    <>
      {error && (
        <div className="mb-4 rounded-sm border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          {error}
        </div>
      )}

      <SearchBar
        model={novaUnidadeConsumidora}
        dados={data}
        setDados={setFilteredData}
        campos={campos}
        setCampos={setCampos}
        onCadastrar={handleCreate}
        formFields={formFields}
      />

      <Table
        data={filteredData}
        columns={columns}
        onEdit={handleUpdate}
        onDelete={handleDelete}
        formFields={formFields}
        emptyTitle="Nenhuma unidade consumidora cadastrada"
        emptyDescription="Cadastre uma nova unidade consumidora para iniciar o controle."
        exportConfig={{ enabled: true, title: "Unidades Consumidoras", fileName: "unidades-consumidoras", allData: data }}
        paginationEnabled={true}
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          totalRecords: pagination.totalRecords,
          pageSize: pagination.pageSize,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
        }}
      />
    </>
  );
}

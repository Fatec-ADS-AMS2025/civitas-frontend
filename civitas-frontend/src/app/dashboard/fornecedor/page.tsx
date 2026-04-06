"use client";

import React, { useEffect, useState } from "react";
import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
import {
  composeValidators,
  normalizeFornecedorPayload,
  validateDigitsLength,
  validateMaxLength,
  validateUfCode,
} from "@/global/formPayload";
import {
  getSituacaoLabel,
  SITUACAO_ATIVO,
  SITUACAO_OPTIONS,
} from "@/global/situacao";
import { fornecedorService } from "@/hooks/fornecedor";
import type { ListQuery, PaginatedResult } from "@/hooks/generic";
import FornecedorDTO from "@/models/fornecedor";
import { SkeletonTable } from "@/components/skeleton";
// Usando o tipo do service

type Fornecedor = FornecedorDTO;
type FornecedorRow = Fornecedor & { situacaoLabel: string };
type PaginationState = Pick<
  PaginatedResult<FornecedorRow>,
  "currentPage" | "pageSize" | "totalPages" | "totalRecords"
>;

const DEFAULT_PAGE_QUERY: Required<Pick<ListQuery, "page" | "size">> = {
  page: 1,
  size: 20,
};

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const novoFornecedor = {
  idFornecedor: 0,
  nomeFantasia: "",
  situacao: SITUACAO_ATIVO,
  cnpj: "",
  nome: "",
  logradouro: "",
  numero: "",
  bairro: "",
  cep: "",
  telefone: "",
  email: "",
  cidade: "",
  estado: "",
};

const columns = [
  { id: "idFornecedor", label: "ID Fornecedor" },
  { id: "nomeFantasia", label: "Nome Fantasia" },
  { id: "cnpj", label: "CNPJ" },
  { id: "telefone", label: "Telefone" },
  { id: "situacaoLabel", label: "Situação" },
];

const camposConst: FieldConfig[] = [
  { key: "nomeFantasia", placeholder: "Nome Fantasia", local: "principal" },
  { key: "cnpj", placeholder: "CNPJ", local: "principal" },
  { key: "telefone", placeholder: "Telefone", local: "filtro" },
  {
    key: "situacao",
    placeholder: "Situação",
    local: "filtro",
    type: "select",
    options: SITUACAO_OPTIONS,
  },
  { key: "cidade", placeholder: "Cidade", local: "filtro" },
];

const fornecedorFormFields: ModalFieldConfig[] = [
  { key: "idFornecedor", hidden: true },
  {
    key: "nomeFantasia",
    label: "Nome Fantasia",
    placeholder: "Nome fantasia do fornecedor",
    required: true,
  },
  {
    key: "nome",
    label: "Razão Social / Nome",
    placeholder: "Nome ou razão social do fornecedor",
    required: true,
  },
  {
    key: "cnpj",
    label: "CNPJ",
    placeholder: "00.000.000/0000-00",
    required: true,
    validate: validateDigitsLength("CNPJ", 14),
  },
  {
    key: "logradouro",
    label: "Logradouro",
    placeholder: "Rua / Avenida",
    required: true,
  },
  {
    key: "numero",
    label: "Número",
    placeholder: "Número",
    required: true,
    validate: validateMaxLength("Número", 10),
  },
  {
    key: "bairro",
    label: "Bairro",
    placeholder: "Bairro",
    required: true,
  },
  {
    key: "cep",
    label: "CEP",
    placeholder: "00000-000",
    required: true,
    validate: validateDigitsLength("CEP", 8),
  },
  {
    key: "cidade",
    label: "Cidade",
    placeholder: "Cidade",
    required: true,
  },
  {
    key: "estado",
    label: "Estado",
    placeholder: "UF",
    required: true,
    validate: composeValidators(
      validateUfCode(),
      validateMaxLength("Estado", 2)
    ),
  },
  {
    key: "telefone",
    label: "Telefone",
    placeholder: "(00) 00000-0000",
    type: "tel",
    required: true,
  },
  {
    key: "email",
    label: "E-mail",
    placeholder: "email@fornecedor.com.br",
    type: "email",
    required: true,
  },
  {
    key: "situacao",
    label: "Situação",
    type: "select",
    required: true,
    options: SITUACAO_OPTIONS,
  },
];

const mapFornecedorRows = (items: Fornecedor[]): FornecedorRow[] => {
  return items.map((item) => ({
    ...item,
    situacaoLabel: getSituacaoLabel(item.situacao),
  }));
};

const toFornecedorPageResult = (
  pageResult: PaginatedResult<Fornecedor>
): PaginatedResult<FornecedorRow> => {
  return {
    ...pageResult,
    items: mapFornecedorRows(pageResult.items),
  };
};

const shouldLoadPreviousPage = (pageResult: PaginatedResult<FornecedorRow>): boolean => {
  return (
    pageResult.totalRecords > 0 &&
    pageResult.totalPages > 0 &&
    pageResult.items.length === 0 &&
    pageResult.currentPage > pageResult.totalPages
  );
};

const emptyPaginationState: PaginationState = {
  currentPage: DEFAULT_PAGE_QUERY.page,
  pageSize: DEFAULT_PAGE_QUERY.size,
  totalPages: 0,
  totalRecords: 0,
};

export default function Page() {
  const [fornecedores, setFornecedores] = useState<FornecedorRow[]>([]);
  const [filteredData, setFilteredData] = useState<FornecedorRow[]>([]);
  const [campos, setCampos] = useState<FieldConfig[]>(camposConst);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginationState, setPaginationState] = useState<PaginationState>(emptyPaginationState);
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE_QUERY.page);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_QUERY.size);

  const applyFornecedorPage = (pageResult: PaginatedResult<FornecedorRow>) => {
    setFornecedores(pageResult.items);
    setFilteredData(pageResult.items);
    setPaginationState({
      currentPage: pageResult.currentPage,
      pageSize: pageResult.pageSize,
      totalPages: pageResult.totalPages,
      totalRecords: pageResult.totalRecords,
    });
    setCurrentPage(pageResult.currentPage);
    setPageSize(pageResult.pageSize);
  };

  const loadFornecedorPage = async (
    query: ListQuery = { page: currentPage, size: pageSize }
  ) => {
    try {
      setLoading(true);

      const initialPage = toFornecedorPageResult(await fornecedorService.getPage(query));
      const resolvedPage = shouldLoadPreviousPage(initialPage)
        ? toFornecedorPageResult(
            await fornecedorService.getPage({
              ...query,
              page: initialPage.totalPages,
              size: initialPage.pageSize,
            })
          )
        : initialPage;

      applyFornecedorPage(resolvedPage);
      setError(null);
      return resolvedPage;
    } catch (err) {
      console.error("Erro ao carregar fornecedores:", err);
      setFornecedores([]);
      setFilteredData([]);
      setPaginationState(emptyPaginationState);
      setError(
        "Não foi possível carregar os fornecedores. Verifique o backend e tente novamente."
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadFornecedorPage(DEFAULT_PAGE_QUERY);
  }, []);

  const handleCreate = async (novoFornecedorData: Omit<Fornecedor, "idFornecedor">) => {
    await fornecedorService.create(normalizeFornecedorPayload(novoFornecedorData));
    await loadFornecedorPage({ page: currentPage, size: pageSize });
  };

  const handleUpdate = async (id: number, dadosAtualizados: Partial<Fornecedor>) => {
    await fornecedorService.update(
      id,
      normalizeFornecedorPayload(dadosAtualizados)
    );
    await loadFornecedorPage({ page: currentPage, size: pageSize });
  };

  const handleDelete = async (id: number) => {
    await fornecedorService.alterarSituacao(id);
    await loadFornecedorPage({ page: currentPage, size: pageSize });
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage === currentPage) {
      return;
    }

    void loadFornecedorPage({ page: nextPage, size: pageSize });
  };

  const handlePageSizeChange = (nextSize: number) => {
    if (nextSize < 1 || nextSize === pageSize) {
      return;
    }

    void loadFornecedorPage({ page: DEFAULT_PAGE_QUERY.page, size: nextSize });
  };

  if (loading) {
    return <SkeletonTable rows={5} cols={4} />;
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          {error}
        </div>
      )}

      <SearchBar
        model={novoFornecedor}
        dados={fornecedores}
        setDados={setFilteredData}
        campos={campos}
        setCampos={setCampos}
        onCadastrar={handleCreate}
        formFields={fornecedorFormFields}
      />

      <Table
        data={filteredData}
        columns={columns}
        onEdit={handleUpdate}
        onDelete={handleDelete}
        formFields={fornecedorFormFields}
        paginationEnabled={true}
        pagination={{
          currentPage: paginationState.currentPage,
          totalPages: paginationState.totalPages,
          totalRecords: paginationState.totalRecords,
          pageSize: paginationState.pageSize,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
        }}
      />
    </>
  );
}

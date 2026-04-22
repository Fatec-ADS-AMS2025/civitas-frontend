"use client";

import React, { useEffect, useState } from "react";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
import { SkeletonTable } from "@/components/skeleton";
import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";
import { usuarioService } from "@/hooks/usuario";
import { getSituacaoLabel, SITUACAO_ATIVO, SITUACAO_OPTIONS } from "@/global/situacao";
import UsuarioDTO from "@/models/usuario";
import type { ListQuery, PaginatedResult } from "@/hooks/generic";

type User = UsuarioDTO;
type UserRow = User & {
  tipoUsuarioLabel: string;
  situacaoLabel: string;
};
type PaginationState = Pick<
  PaginatedResult<UserRow>,
  "currentPage" | "pageSize" | "totalPages" | "totalRecords"
>;

const DEFAULT_PAGE_QUERY: Required<Pick<ListQuery, "page" | "size">> = {
  page: 1,
  size: 10,
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const TIPO_USUARIO_OPTIONS = [
  { value: 1, label: "Visitante" },
  { value: 2, label: "Administrador" },
  { value: 3, label: "Funcionario" },
];

const getTipoUsuarioLabel = (value: number | null | undefined): string => {
  const item = TIPO_USUARIO_OPTIONS.find((option) => option.value === value);
  return item?.label ?? "Visitante";
};

const novoUsuario: User = {
  id: 0,
  cpf: "",
  nome: "",
  rg: "",
  logradouro: "",
  numero: "",
  matricula: "",
  cidade: "",
  estado: "",
  cep: "",
  bairro: "",
  email: "",
  senha: "",
  situacao: SITUACAO_ATIVO,
  tipoUsuario: 1,
};

const columns = [
  { id: "nome", label: "Nome" },
  { id: "cpf", label: "CPF" },
  { id: "matricula", label: "Matricula" },
  { id: "cidade", label: "Cidade" },
  { id: "estado", label: "Estado" },
  { id: "email", label: "E-mail" },
  { id: "tipoUsuarioLabel", label: "Tipo" },
  { id: "situacaoLabel", label: "Situacao" },
];

const camposConst: FieldConfig[] = [
  { key: "nome", placeholder: "Nome", local: "principal" },
  { key: "cpf", placeholder: "CPF", local: "principal" },
  { key: "matricula", placeholder: "Matricula", local: "filtro" },
  { key: "cidade", placeholder: "Cidade", local: "filtro" },
  { key: "email", placeholder: "E-mail", local: "filtro" },
  { key: "estado", placeholder: "Estado", local: "filtro" },
  {
    key: "tipoUsuario",
    placeholder: "Tipo",
    local: "filtro",
    type: "select",
    options: TIPO_USUARIO_OPTIONS,
  },
  {
    key: "situacao",
    placeholder: "Situacao",
    local: "filtro",
    type: "select",
    options: SITUACAO_OPTIONS,
  },
];

const usuarioFormFields: ModalFieldConfig[] = [
  { key: "id", hidden: true },
  { key: "nome", label: "Nome", placeholder: "Nome completo", required: true },
  { key: "cpf", label: "CPF", placeholder: "000.000.000-00", required: true },
  { key: "rg", label: "RG", placeholder: "RG", required: true },
  { key: "matricula", label: "Matricula", placeholder: "MAT-0000", required: true },
  { key: "logradouro", label: "Logradouro", placeholder: "Rua / Avenida", required: true },
  { key: "numero", label: "Numero", placeholder: "Numero", required: true },
  { key: "bairro", label: "Bairro", placeholder: "Bairro", required: true },
  { key: "cep", label: "CEP", placeholder: "00000-000", required: true },
  { key: "cidade", label: "Cidade", placeholder: "Cidade", required: true },
  { key: "estado", label: "Estado", placeholder: "UF", required: true },
  { key: "email", label: "E-mail", placeholder: "email@exemplo.com", type: "email", required: true },
  { key: "senha", label: "Senha", placeholder: "Senha", type: "password", required: true },
  {
    key: "tipoUsuario",
    label: "Tipo",
    type: "select",
    required: true,
    options: TIPO_USUARIO_OPTIONS,
  },
  {
    key: "situacao",
    label: "Situacao",
    type: "select",
    required: true,
    options: SITUACAO_OPTIONS,
  },
];

const toNumber = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const mapUsuarioToRow = (api: Partial<User>): UserRow => {
  const tipoUsuario = toNumber(api.tipoUsuario, 1);
  const situacao = toNumber(api.situacao, SITUACAO_ATIVO);

  return {
    id: toNumber(api.id, 0),
    cpf: String(api.cpf ?? ""),
    nome: String(api.nome ?? ""),
    rg: String(api.rg ?? ""),
    logradouro: String(api.logradouro ?? ""),
    numero: String(api.numero ?? ""),
    matricula: String(api.matricula ?? ""),
    cidade: String(api.cidade ?? ""),
    estado: String(api.estado ?? ""),
    cep: String(api.cep ?? ""),
    bairro: String(api.bairro ?? ""),
    email: String(api.email ?? ""),
    senha: String(api.senha ?? ""),
    situacao,
    tipoUsuario,
    tipoUsuarioLabel: getTipoUsuarioLabel(tipoUsuario),
    situacaoLabel: getSituacaoLabel(situacao),
  };
};

const toUsuarioPageResult = (pageResult: PaginatedResult<User>): PaginatedResult<UserRow> => {
  return {
    ...pageResult,
    items: pageResult.items.map(mapUsuarioToRow),
  };
};

const shouldLoadPreviousPage = (pageResult: PaginatedResult<UserRow>): boolean => {
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

const toApiUsuarioPayload = (data: Partial<User>, base?: Partial<User>): User => {
  return {
    id: Number(data.id ?? base?.id ?? 0),
    cpf: String(data.cpf ?? base?.cpf ?? ""),
    nome: String(data.nome ?? base?.nome ?? ""),
    rg: String(data.rg ?? base?.rg ?? ""),
    logradouro: String(data.logradouro ?? base?.logradouro ?? ""),
    numero: String(data.numero ?? base?.numero ?? ""),
    matricula: String(data.matricula ?? base?.matricula ?? ""),
    cidade: String(data.cidade ?? base?.cidade ?? ""),
    estado: String(data.estado ?? base?.estado ?? ""),
    cep: String(data.cep ?? base?.cep ?? ""),
    bairro: String(data.bairro ?? base?.bairro ?? ""),
    email: String(data.email ?? base?.email ?? ""),
    senha: String(data.senha ?? base?.senha ?? ""),
    situacao: toNumber(data.situacao ?? base?.situacao, SITUACAO_ATIVO),
    tipoUsuario: toNumber(data.tipoUsuario ?? base?.tipoUsuario, 1),
  };
};

const Page = () => {
  const [usuarios, setUsuarios] = useState<UserRow[]>([]);
  const [filteredData, setFilteredData] = useState<UserRow[]>([]);
  const [campos, setCampos] = useState<FieldConfig[]>(camposConst);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginationState, setPaginationState] = useState<PaginationState>(emptyPaginationState);
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE_QUERY.page);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_QUERY.size);

  const applyUsuarioPage = (pageResult: PaginatedResult<UserRow>) => {
    setUsuarios(pageResult.items);
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

  const loadUsuarios = async (
    query: ListQuery = { page: currentPage, size: pageSize }
  ) => {
    try {
      setLoading(true);

      const initialPage = toUsuarioPageResult(await usuarioService.getPage(query));
      const resolvedPage = shouldLoadPreviousPage(initialPage)
        ? toUsuarioPageResult(
            await usuarioService.getPage({
              ...query,
              page: initialPage.totalPages,
              size: initialPage.pageSize,
            })
          )
        : initialPage;

      applyUsuarioPage(resolvedPage);
      setError(null);
      return resolvedPage;
    } catch (err) {
      console.error("Erro ao carregar usuarios:", err);
      setUsuarios([]);
      setFilteredData([]);
      setPaginationState(emptyPaginationState);
      setError("Nao foi possivel carregar usuarios.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsuarios(DEFAULT_PAGE_QUERY);
  }, []);

  const handleCreate = async (novoUsuarioData: Omit<User, "id">) => {
    const payload = toApiUsuarioPayload(novoUsuarioData);
    await usuarioService.create(payload);
    await loadUsuarios({ page: currentPage, size: pageSize });
  };

  const handleUpdate = async (id: number, dadosAtualizados: Partial<User>) => {
    const current = usuarios.find((item) => item.id === id);
    const payload = toApiUsuarioPayload({ ...dadosAtualizados, id }, current);

    await usuarioService.update(id, payload);
    await loadUsuarios({ page: currentPage, size: pageSize });
  };

  const handleDelete = async (id: number) => {
    await usuarioService.alterarSituacao(id);
    await loadUsuarios({ page: currentPage, size: pageSize });
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage === currentPage) {
      return;
    }

    void loadUsuarios({ page: nextPage, size: pageSize });
  };

  const handlePageSizeChange = (nextSize: number) => {
    if (nextSize < 1 || nextSize === pageSize) {
      return;
    }

    void loadUsuarios({ page: DEFAULT_PAGE_QUERY.page, size: nextSize });
  };

  if (loading) {
    return <SkeletonTable rows={5} cols={4} />;
  }

  if (error) {
    return <div>Erro: {error}</div>;
  }

  return (
    <>
      <SearchBar
        model={novoUsuario}
        dados={usuarios}
        setDados={setFilteredData}
        campos={campos}
        setCampos={setCampos}
        onCadastrar={handleCreate}
        formFields={usuarioFormFields}
      />

      <Table
        data={filteredData}
        columns={columns}
        onEdit={handleUpdate}
        onDelete={handleDelete}
        formFields={usuarioFormFields}
        exportConfig={{
          enabled: true,
          title: "Usuarios",
          fileName: "usuarios",
          allData: usuarios,
        }}
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
};

export default Page;

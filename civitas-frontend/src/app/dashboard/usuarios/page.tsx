"use client";
import React, { useState, useEffect } from "react";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
import { usuarioService } from "@/hooks/usuario";
import UsuarioDTO from "@/models/usuario";
import type { FieldConfig as ModalFieldConfig} from "@/components/Form/form";

// Usando o tipo do service
type User = UsuarioDTO;

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
  situacao: 1,
  tipoUsuario: 1,
};

const columns = [
  { id: "nome", label: "Nome" },
  { id: "cpf", label: "CPF" },
  { id: "rg", label: "RG" },
  { id: "matricula", label: "Matrícula" },
  { id: "cidade", label: "Cidade" },
  { id: "estado", label: "Estado" },
  { id: "email", label: "E-mail" },
  { id: "situacao", label: "Situação" },
  { id: "tipoUsuario", label: "Tipo" },
];

const camposConst: FieldConfig[] = [
  { key: "nome", placeholder: "Nome", local: "principal" },
  { key: "cpf", placeholder: "CPF", local: "principal" },
  { key: "rg", placeholder: "RG", local: "filtro" },
  { key: "matricula", placeholder: "Matrícula", local: "filtro" },
  { key: "cidade", placeholder: "Cidade", local: "filtro" },
  { key: "email", placeholder: "E-mail", local: "filtro" },
  { key: "estado", placeholder: "Estado", local: "filtro" },
  {
    key: "tipoUsuario",
    placeholder: "Tipo",
    local: "filtro",
    type: "select",
    options: [
      { value: "1", label: "Visitante" },
      { value: "2", label: "Administrador" },
      { value: "3", label: "Funcionário" },
    ],
  },
];

const usuarioFormFields: ModalFieldConfig[] = [
  { key: "id", hidden: true },
  { key: "nome", label: "Nome", placeholder: "Nome completo", required: true },
  { key: "cpf", label: "CPF", placeholder: "000.000.000-00", required: true },
  { key: "rg", label: "RG", placeholder: "00.000.000-0", required: true },
  { key: "logradouro", label: "Logradouro", placeholder: "Rua / Avenida", required: true },
  { key: "numero", label: "Número", placeholder: "Número", required: true },
  { key: "bairro", label: "Bairro", placeholder: "Bairro", required: true },
  { key: "cep", label: "CEP", placeholder: "00000000", required: true },
  { key: "matricula", label: "Matrícula", placeholder: "MAT-0000", required: true },
  { key: "cidade", label: "Cidade", placeholder: "Cidade", required: true },
  { key: "estado", label: "Estado", placeholder: "UF", required: true },
  { key: "email", label: "E-mail", placeholder: "email@exemplo.com", type: "email" },
  { key: "senha", label: "Senha", placeholder: "Senha", type: "password", required: true },
  {
    key: "situacao",
    label: "Situação",
    type: "select",
    required: true,
    options: [
      { value: "1", label: "Ativo" },
      { value: "2", label: "Inativo" },
    ],
  },
  {
    key: "tipoUsuario",
    label: "Tipo",
    type: "select",
    required: true,
    options: [
      { value: "1", label: "Visitante" },
      { value: "2", label: "Administrador" },
      { value: "3", label: "Funcionário" },
    ],
  },
];

const toUsuarioPayload = (data: Partial<User>, id?: number): User => ({
  id: id ?? Number(data.id ?? 0),
  cpf: String(data.cpf ?? ""),
  nome: String(data.nome ?? ""),
  rg: String(data.rg ?? ""),
  logradouro: String(data.logradouro ?? ""),
  numero: String(data.numero ?? ""),
  cidade: String(data.cidade ?? ""),
  estado: String(data.estado ?? ""),
  cep: String(data.cep ?? ""),
  bairro: String(data.bairro ?? ""),
  email: String(data.email ?? ""),
  senha: String(data.senha ?? ""),
  matricula: String(data.matricula ?? ""),
  situacao: Number(data.situacao ?? 1),
  tipoUsuario: Number(data.tipoUsuario ?? 1),
});


const Page = () => {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [filteredData, setFilteredData] = useState<User[]>([]);
  const [campos, setCampos] = useState<FieldConfig[]>(camposConst);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const list = await usuarioService.getAllData();
      setUsuarios(list);
      setFilteredData(list);
      setError(null);
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
      setUsuarios([]);
      setFilteredData([]);
      setError("Não foi possível carregar usuários. Verifique o backend e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsuarios();
  }, []);

  // Função para criar novo usuário
  const handleCreate = async (novoUsuarioData: Omit<User, "id">) => {
    try {
      const payload = toUsuarioPayload(novoUsuarioData, 0);
      const created = await usuarioService.createData(payload);
      await loadUsuarios();
      return created;
    } catch (err) {
      console.error("Erro ao criar usuário:", err);
      throw err;
    }
  };

  // Função para atualizar usuário
  const handleUpdate = async (id: number, dadosAtualizados: Partial<User>) => {
    try {
      const payload = toUsuarioPayload(dadosAtualizados, id);
      const updated = await usuarioService.updateData(id, payload);
      await loadUsuarios();
      return updated;
    } catch (err) {
      console.error("Erro ao atualizar usuário:", err);
      throw err;
    }
  };

  // Função para deletar usuário
  const handleDelete = async (id: number) => {
    try {
      await usuarioService.delete(id);
      await loadUsuarios();
    } catch (err) {
      console.error("Erro ao deletar usuário:", err);
      throw err;
    }
  };

  if (loading) {
    return <div>Carregando usuários...</div>;
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          {error}
        </div>
      )}

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
       
      />
    </>
  );
};

export default Page;
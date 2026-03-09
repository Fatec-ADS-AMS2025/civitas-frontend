"use client";
import React, { useState, useEffect } from "react";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
// import { usuarioService } from "@/hooks/usuario";
import UsuarioDTO from "@/models/usuario";
import type { FieldConfig as ModalFieldConfig} from "@/components/Form/form";

// Usando o tipo do service
type User = UsuarioDTO;

const novoUsuario: User = {
  id: 0,
  nome: "",
  cpf: "",
  matricula: "",
  cidade: "",
  estado: "",
  email: "",
  telefone: "",
  tipo: "Cidadão",
};

const columns = [
  { id: "nome", label: "Nome" },
  { id: "cpf", label: "CPF" },
  { id: "matricula", label: "Matrícula" },
  { id: "cidade", label: "Cidade" },
  { id: "estado", label: "Estado" },
  { id: "email", label: "E-mail" },
  { id: "telefone", label: "Telefone" },
  { id: "tipo", label: "Tipo" },
];

const camposConst: FieldConfig[] = [
  { key: "nome", placeholder: "Nome", local: "principal" },
  { key: "cpf", placeholder: "CPF", local: "principal" },
  { key: "matricula", placeholder: "Matrícula", local: "filtro" },
  { key: "cidade", placeholder: "Cidade", local: "filtro" },
  { key: "email", placeholder: "E-mail", local: "filtro" },
  { key: "estado", placeholder: "Estado", local: "filtro" },
  {
    key: "tipo",
    placeholder: "Tipo",
    local: "filtro",
    type: "select",
    options: [
      { value: "Administrador", label: "Administrador" },
      { value: "Cidadão", label: "Cidadão" },
      { value: "Funcionário", label: "Funcionário" },
    ],
  },
];

const usuarioFormFields: ModalFieldConfig[] = [
  { key: "id", hidden: true },
  { key: "nome", label: "Nome", placeholder: "Nome completo", required: true },
  { key: "cpf", label: "CPF", placeholder: "000.000.000-00", required: true },
  { key: "matricula", label: "Matrícula", placeholder: "MAT-0000", required: true },
  { key: "cidade", label: "Cidade", placeholder: "Cidade", required: true },
  { key: "estado", label: "Estado", placeholder: "UF", required: true },
  { key: "email", label: "E-mail", placeholder: "email@exemplo.com", type: "email" },
  { key: "telefone", label: "Telefone", placeholder: "(00) 00000-0000", type: "tel" },
  {
    key: "tipo",
    label: "Tipo",
    type: "select",
    required: true,
    options: [
      { value: "Administrador", label: "Administrador" },
      { value: "Cidadão", label: "Cidadão" },
      { value: "Funcionário", label: "Funcionário" },
    ],
  },
];


const Page = () => {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [filteredData, setFilteredData] = useState<User[]>([]);
  const [campos, setCampos] = useState<FieldConfig[]>(camposConst);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dadosFicticios: User[] = [
    {
      id: 1,
      nome: "João da Silva",
      cpf: "123.456.789-01",
      matricula: "MAT-1001",
      cidade: "São Paulo",
      estado: "SP",
      email: "joao.silva@exemplo.com",
      telefone: "(11) 99999-1111",
      tipo: "Administrador",
    },
    {
      id: 2,
      nome: "Maria Oliveira",
      cpf: "234.567.890-12",
      matricula: "MAT-1002",
      cidade: "Rio de Janeiro",
      estado: "RJ",
      email: "maria.oliveira@exemplo.com",
      telefone: "(21) 98888-2222",
      tipo: "Funcionário",
    },
    {
      id: 3,
      nome: "Carlos Santos",
      cpf: "345.678.901-23",
      matricula: "MAT-1003",
      cidade: "Belo Horizonte",
      estado: "MG",
      email: "carlos.santos@exemplo.com",
      telefone: "(31) 97777-3333",
      tipo: "Cidadão",
    },
    {
      id: 4,
      nome: "Ana Souza",
      cpf: "456.789.012-34",
      matricula: "MAT-1004",
      cidade: "Curitiba",
      estado: "PR",
      email: "ana.souza@exemplo.com",
      telefone: "(41) 96666-4444",
      tipo: "Funcionário",
    },
    {
      id: 5,
      nome: "Pedro Lima",
      cpf: "567.890.123-45",
      matricula: "MAT-1005",
      cidade: "Florianópolis",
      estado: "SC",
      email: "pedro.lima@exemplo.com",
      telefone: "(48) 95555-5555",
      tipo: "Cidadão",
    },
  ];

  // Carregar dados
  useEffect(() => {
    const loadUsuarios = async () => {
      try {
        setLoading(true);

        // =========================
        // TESTE COM DADOS FICTÍCIOS
        // =========================
        setUsuarios(dadosFicticios);
        setFilteredData(dadosFicticios);
        setError(null);

        // =========================
        // CÓDIGO ORIGINAL DA API
        // =========================
        /*
        const data: any = await usuarioService.getAll();
        const list = Array.isArray(data?.data) ? data.data : [];
        setUsuarios(list);
        setFilteredData(list);
        setError(null);
        */
      } catch (err) {
        console.error("Erro ao carregar usuários:", err);
        setUsuarios([]);
        setFilteredData([]);
        setError("Não foi possível carregar usuários. Verifique o backend e tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    loadUsuarios();
  }, []);

  // Função para criar novo usuário
  const handleCreate = async (novoUsuarioData: Omit<User, "id">) => {
    try {
      // =========================
      // TESTE COM DADOS FICTÍCIOS
      // =========================
      const created: User = {
        ...novoUsuarioData,
        id: usuarios.length > 0 ? Math.max(...usuarios.map((u) => u.id)) + 1 : 1,
      };

      const updatedData = [...usuarios, created];
      setUsuarios(updatedData);
      setFilteredData(updatedData);
      return created;

      // =========================
      // CÓDIGO ORIGINAL DA API
      // =========================
      /*
      const created = await usuarioService.create(novoUsuarioData);
      const updatedData = [...usuarios, created];
      setUsuarios(updatedData);
      setFilteredData(updatedData);
      return created;
      */
    } catch (err) {
      console.error("Erro ao criar usuário:", err);
      throw err;
    }
  };

  // Função para atualizar usuário
  const handleUpdate = async (id: number, dadosAtualizados: Partial<User>) => {
    try {
      // =========================
      // TESTE COM DADOS FICTÍCIOS
      // =========================
      const updatedData = usuarios.map((u) =>
        u.id === id ? { ...u, ...dadosAtualizados } : u
      );

      const updated = updatedData.find((u) => u.id === id);
      setUsuarios(updatedData);
      setFilteredData(updatedData);
      return updated;

      // =========================
      // CÓDIGO ORIGINAL DA API
      // =========================
      /*
      const updated = await usuarioService.update(id, dadosAtualizados);
      const updatedData = usuarios.map(u => u.id === id ? updated : u);
      setUsuarios(updatedData);
      setFilteredData(updatedData);
      return updated;
      */
    } catch (err) {
      console.error("Erro ao atualizar usuário:", err);
      throw err;
    }
  };

  // Função para deletar usuário
  const handleDelete = async (id: number) => {
    try {
      // =========================
      // TESTE COM DADOS FICTÍCIOS
      // =========================
      const updatedData = usuarios.filter((u) => u.id !== id);
      setUsuarios(updatedData);
      setFilteredData(updatedData);

      // =========================
      // CÓDIGO ORIGINAL DA API
      // =========================
      /*
      await usuarioService.delete(id);
      const updatedData = usuarios.filter(u => u.id !== id);
      setUsuarios(updatedData);
      setFilteredData(updatedData);
      */
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
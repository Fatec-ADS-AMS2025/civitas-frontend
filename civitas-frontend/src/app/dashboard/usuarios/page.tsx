"use client";
import React, { useState, useEffect } from "react";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
import { usuarioService } from "@/hooks/usuario";
import UsuarioDTO from "@/models/usuario";

// Usando o tipo do service
type User = UsuarioDTO;

const novoUsuario: User = {
  id: 0,
  nome: "",
  cpf: "",
  matricula: "",
  cidade: "",
  estado: "",
  tipo: "Cidadão",
};

const columns = [
  { id: "nome", label: "Nome" },
  { id: "cpf", label: "CPF" },
  { id: "matricula", label: "Matrícula" },
  { id: "cidade", label: "Cidade" },
  { id: "estado", label: "Estado" },
  { id: "tipo", label: "Tipo" },
];

const camposConst: FieldConfig[] = [
  { key: "nome", placeholder: "Nome", local: "principal" },
  { key: "cpf", placeholder: "CPF", local: "principal" },
  { key: "matricula", placeholder: "Matrícula", local: "filtro" },
  { key: "cidade", placeholder: "Cidade", local: "filtro" },
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

const Page = () => {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [filteredData, setFilteredData] = useState<User[]>([]);
  const [campos, setCampos] = useState<FieldConfig[]>(camposConst);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados da API
  useEffect(() => {
    const loadUsuarios = async () => {
      try {
        setLoading(true);
        const data: any = await usuarioService.getAll();
        setUsuarios(data.data);
        setFilteredData(data.data);
      } catch (err) {
        console.error('Erro ao carregar usuários:', err);
        setError('Erro ao carregar dados dos usuários');
      } finally {
        setLoading(false);
      }
    };

    loadUsuarios();
  }, []);

  // Função para criar novo usuário
  const handleCreate = async (novoUsuarioData: Omit<User, 'id'>) => {
    try {
      const created = await usuarioService.create(novoUsuarioData);
      const updatedData = [...usuarios, created];
      setUsuarios(updatedData);
      setFilteredData(updatedData);
      return created;
    } catch (err) {
      console.error('Erro ao criar usuário:', err);
      throw err;
    }
  };

  // Função para atualizar usuário
  const handleUpdate = async (id: number, dadosAtualizados: Partial<User>) => {
    try {
      const updated = await usuarioService.update(id, dadosAtualizados);
      const updatedData = usuarios.map(u => u.id === id ? updated : u);
      setUsuarios(updatedData);
      setFilteredData(updatedData);
      return updated;
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      throw err;
    }
  };

  // Função para deletar usuário
  const handleDelete = async (id: number) => {
    try {
      await usuarioService.delete(id);
      const updatedData = usuarios.filter(u => u.id !== id);
      setUsuarios(updatedData);
      setFilteredData(updatedData);
    } catch (err) {
      console.error('Erro ao deletar usuário:', err);
      throw err;
    }
  };

if (loading) {
  return <div>Carregando usuários...</div>;
}

if (error) {
  return <div>Erro: {error}</div>;
}

return (
  <>
    {/* Barra de busca */}
    <SearchBar 
      model={novoUsuario} 
      dados={usuarios} 
      setDados={setFilteredData} 
      campos={campos} 
      setCampos={setCampos}
      onCadastrar={handleCreate}
    />

    {/* Tabela de resultados */}
    <Table 
      data={filteredData} 
      columns={columns}
      onEdit={handleUpdate}
      onDelete={handleDelete}
    />
  </>
);
};

export default Page;
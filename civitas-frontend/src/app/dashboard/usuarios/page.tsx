"use client";
import React, { useState, useEffect } from "react";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
import { usuarioService } from "@/hooks/usuario";
import UsuarioDTO from "@/models/usuario";
import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";

type User = UsuarioDTO;
type ApiUsuario = Record<string, any>;

const novoUsuario: User = {
  id: 0,
  nome: "",
  cpf: "",
  matricula: "",
  cidade: "",
  estado: "",
  email: "",
  telefone: "",
  tipo: "Visitante",
};

const columns = [
  { id: "nome", label: "Nome" },
  { id: "cpf", label: "CPF" },
  { id: "matricula", label: "Matricula" },
  { id: "cidade", label: "Cidade" },
  { id: "estado", label: "Estado" },
  { id: "email", label: "E-mail" },
  { id: "tipo", label: "Tipo" },
];

const camposConst: FieldConfig[] = [
  { key: "nome", placeholder: "Nome", local: "principal" },
  { key: "cpf", placeholder: "CPF", local: "principal" },
  { key: "matricula", placeholder: "Matricula", local: "filtro" },
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
      { value: "Visitante", label: "Visitante" },
      { value: "Funcionario", label: "Funcionario" },
    ],
  },
];

const usuarioFormFields: ModalFieldConfig[] = [
  { key: "id", hidden: true },
  { key: "nome", label: "Nome", placeholder: "Nome completo", required: true },
  { key: "cpf", label: "CPF", placeholder: "000.000.000-00", required: true },
  { key: "matricula", label: "Matricula", placeholder: "MAT-0000", required: true },
  { key: "cidade", label: "Cidade", placeholder: "Cidade", required: true },
  { key: "estado", label: "Estado", placeholder: "UF", required: true },
  { key: "email", label: "E-mail", placeholder: "email@exemplo.com", type: "email" },
  {
    key: "tipo",
    label: "Tipo",
    type: "select",
    required: true,
    options: [
      { value: "Administrador", label: "Administrador" },
      { value: "Visitante", label: "Visitante" },
      { value: "Funcionario", label: "Funcionario" },
    ],
  },
];

const resolveUserId = (api: ApiUsuario): number => {
  const rawId = api?.id ?? api?.idUsuario ?? api?.usuarioId ?? api?.id_usuario ?? 0;
  const id = Number(rawId);
  return Number.isFinite(id) ? id : 0;
};

const Page = () => {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [filteredData, setFilteredData] = useState<User[]>([]);
  const [campos, setCampos] = useState<FieldConfig[]>(camposConst);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapApiUsuarioToUser = (api: ApiUsuario): User => {
    const tipoRaw = api?.tipo ?? api?.tipoUsuario;

    const tipoMapNumero: Record<number, User["tipo"]> = {
      1: "Visitante",
      2: "Administrador",
      3: "Funcionario",
    };

    const tipoMapString: Record<string, User["tipo"]> = {
      VISITANTE: "Visitante",
      ADMINISTRADOR: "Administrador",
      FUNCIONARIO: "Funcionario",
      Visitante: "Visitante",
      Administrador: "Administrador",
      Funcionario: "Funcionario",
    };

    let tipoNormalizado: User["tipo"] = "Visitante";

    if (typeof tipoRaw === "number") {
      tipoNormalizado = tipoMapNumero[tipoRaw] ?? "Visitante";
    } else if (typeof tipoRaw === "string") {
      tipoNormalizado = tipoMapString[tipoRaw] ?? "Visitante";
    }

    return {
      id: resolveUserId(api),
      nome: api?.nome ?? "",
      cpf: api?.cpf ?? "",
      matricula: api?.matricula ?? "",
      cidade: api?.cidade ?? "",
      estado: api?.estado ?? "",
      email: api?.email ?? "",
      telefone: api?.telefone ?? "",
      situacao: Number(api?.situacao ?? 1),
      tipo: tipoNormalizado,
    };
  };

  const toApiUsuarioPayload = (
    data: Partial<User> & Record<string, any>,
    base: ApiUsuario = {}
  ) => {
    const tipoMap: Record<User["tipo"], number> = {
      Visitante: 1,
      Administrador: 2,
      Funcionario: 3,
    };

    const tipoSelecionado = (data.tipo as User["tipo"]) ?? mapApiUsuarioToUser(base).tipo;

    return {
      id: Number(data.id ?? base.id ?? base.idUsuario ?? 0),
      cpf: data.cpf ?? base.cpf ?? "",
      nome: data.nome ?? base.nome ?? "",
      rg: data.rg ?? base.rg ?? "",
      logradouro: data.logradouro ?? base.logradouro ?? "",
      numero: data.numero ?? base.numero ?? "",
      cidade: data.cidade ?? base.cidade ?? "",
      estado: data.estado ?? base.estado ?? "",
      cep: data.cep ?? base.cep ?? "",
      bairro: data.bairro ?? base.bairro ?? "",
      email: data.email ?? base.email ?? "",
      senha: data.senha ?? base.senha ?? "",
      matricula: data.matricula ?? base.matricula ?? "",
      situacao: Number(data.situacao ?? base.situacao ?? 1),
      tipoUsuario: tipoMap[tipoSelecionado],
    };
  };

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const list = await usuarioService.getAll();
      const normalizedList = (list as ApiUsuario[]).map(mapApiUsuarioToUser);
      setUsuarios(normalizedList);
      setFilteredData(normalizedList);
      setError(null);
      return normalizedList;
    } catch (err) {
      console.error("Erro ao carregar usuarios:", err);
      setUsuarios([]);
      setFilteredData([]);
      setError("Nao foi possivel carregar usuarios.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, []);

  const handleCreate = async (novoUsuarioData: Omit<User, "id">) => {
    try {
      const payload = toApiUsuarioPayload(novoUsuarioData as any);
      await usuarioService.create(payload);

      // Recarrega da API para garantir que o novo registro venha com ID real.
      const listaAtualizada = await loadUsuarios();
      const criado = listaAtualizada.find(
        (u) =>
          u.cpf === (novoUsuarioData.cpf ?? "") &&
          u.matricula === (novoUsuarioData.matricula ?? "")
      );

      return criado ?? listaAtualizada[listaAtualizada.length - 1];
    } catch (err) {
      console.error("Erro ao criar usuario:", err);
      throw err;
    }
  };

  const handleUpdate = async (id: number, dadosAtualizados: Partial<User>) => {
    try {
      const idNumerico = Number(id);
      if (!Number.isFinite(idNumerico) || idNumerico <= 0) {
        throw new Error("ID de usuario invalido para atualizacao.");
      }

      const usuarioApiAtual = (await usuarioService.getById(idNumerico)) as unknown as ApiUsuario;
      const payload = toApiUsuarioPayload({ ...dadosAtualizados, id: idNumerico } as any, usuarioApiAtual);

      const updated = await usuarioService.update(idNumerico, payload);
      const normalizedUpdated = mapApiUsuarioToUser(updated as ApiUsuario);

      const updatedData = usuarios.map((u) =>
        Number(u.id) === idNumerico ? normalizedUpdated : u
      );
      setUsuarios(updatedData);
      setFilteredData(updatedData);
      return normalizedUpdated;
    } catch (err) {
      console.error("Erro ao atualizar usuario:", err);
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await usuarioService.delete(id);
      const updatedData = usuarios.filter((u) => u.id !== id);
      setUsuarios(updatedData);
      setFilteredData(updatedData);
    } catch (err) {
      console.error("Erro ao deletar usuario:", err);
      throw err;
    }
  };

  if (loading) {
    return <div>Carregando usuarios...</div>;
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

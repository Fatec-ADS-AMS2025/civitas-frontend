"use client";
import React, { useState, useEffect } from "react";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
import { orcamentoService } from "@/hooks/orcamento";
import OrcamentoDTO from "@/models/orcamento";
import { SkeletonTable } from "@/components/skeleton";
import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";

type Orcamento = OrcamentoDTO & { idInstituicao?: number };
type ApiOrcamento = Record<string, any>;

const novoOrcamento: Orcamento = {
  idOrcamento: 0,
  ano: 0,
  valor: 0,
  descricao: "",
  idInstituicao: 0,
};

const columns = [
  { id: "idOrcamento", label: "ID Orcamento" },
  { id: "ano", label: "Ano" },
  { id: "valor", label: "Valor" },
];

const camposConst: FieldConfig[] = [
  { key: "ano", placeholder: "Ano", local: "principal" },
  { key: "valor", placeholder: "Valor", local: "principal" },
];

const orcamentoFormFields: ModalFieldConfig[] = [
  { key: "idOrcamento", hidden: true },
  {
    key: "idInstituicao",
    label: "ID Instituicao",
    placeholder: "Digite o ID da instituicao",
    required: true,
    type: "number",
  },
  {
    key: "ano",
    label: "Ano",
    placeholder: "Digite o ano",
    required: true,
    type: "number",
  },
  {
    key: "valor",
    label: "Valor",
    placeholder: "Digite o valor do orcamento",
    required: true,
    type: "number",
  },
];

const Page = () => {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [filteredData, setFilteredData] = useState<Orcamento[]>([]);
  const [campos, setCampos] = useState<FieldConfig[]>(camposConst);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapApiOrcamentoToUi = (api: ApiOrcamento): Orcamento => ({
    idOrcamento: Number(api?.idOrcamento ?? api?.id ?? 0),
    ano: Number(api?.ano ?? api?.anoOrcamento ?? 0),
    valor: Number(api?.valor ?? api?.valorOrcamento ?? 0),
    descricao: api?.descricao ?? "",
    situacao: api?.situacao !== undefined ? Number(api.situacao) : undefined,
    idInstituicao: api?.idInstituicao !== undefined ? Number(api.idInstituicao) : 0,
  });

  const toApiOrcamentoPayload = (data: Partial<Orcamento> & Record<string, any>) => ({
    idOrcamento: Number(data.idOrcamento ?? 0),
    anoOrcamento: Number(data.ano ?? data.anoOrcamento ?? 0),
    valorOrcamento: Number(data.valor ?? data.valorOrcamento ?? 0),
    idInstituicao: Number(data.idInstituicao ?? 0),
    descricao: data.descricao ?? "",
    situacao: data.situacao !== undefined ? Number(data.situacao) : 1,
  });

  const loadOrcamentos = async () => {
    try {
      setLoading(true);
      const list = await orcamentoService.getAll();
      const normalizedList = (list as ApiOrcamento[]).map(mapApiOrcamentoToUi);
      setOrcamentos(normalizedList);
      setFilteredData(normalizedList);
      setError(null);
      return normalizedList;
    } catch (err) {
      console.error("Erro ao carregar orcamentos:", err);
      setOrcamentos([]);
      setFilteredData([]);
      setError("Nao foi possivel carregar orcamentos.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrcamentos();
  }, []);

  const handleCreate = async (novoOrcamentoData: Omit<Orcamento, "idOrcamento">) => {
    try {
      const payload = toApiOrcamentoPayload({ ...novoOrcamentoData, idOrcamento: 0 });
      await orcamentoService.create(payload);
      const list = await loadOrcamentos();
      return list[list.length - 1];
    } catch (err) {
      console.error("Erro ao criar orcamento:", err);
      throw err;
    }
  };

  const handleUpdate = async (id: number, dadosAtualizados: Partial<Orcamento>) => {
    try {
      const atual = orcamentos.find((o) => Number(o.idOrcamento) === Number(id));
      const payload = toApiOrcamentoPayload({ ...(atual ?? {}), ...dadosAtualizados, idOrcamento: id });
      const updated = await orcamentoService.update(id, payload);
      const normalizedUpdated = mapApiOrcamentoToUi(updated as ApiOrcamento);
      const updatedData = orcamentos.map((o) =>
        Number(o.idOrcamento) === Number(id) ? normalizedUpdated : o
      );
      setOrcamentos(updatedData);
      setFilteredData(updatedData);
      return normalizedUpdated;
    } catch (err) {
      console.error("Erro ao atualizar orcamento:", err);
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await orcamentoService.delete(id);
      const updatedData = orcamentos.filter((o) => o.idOrcamento !== id);
      setOrcamentos(updatedData);
      setFilteredData(updatedData);
    } catch (err) {
      console.error("Erro ao deletar orcamento:", err);
      throw err;
    }
  };

  if (loading) {
  return <SkeletonTable rows={5} cols={4} />;
}

    return <div>Carregando orcamentos...</div>;
  }

  if (error) {
    return <div>Erro: {error}</div>;
  }

  return (
    <>
      <SearchBar
        model={novoOrcamento}
        dados={orcamentos}
        setDados={setFilteredData}
        campos={campos}
        setCampos={setCampos}
        onCadastrar={handleCreate}
        formFields={orcamentoFormFields}
      />

      <Table
        data={filteredData}
        columns={columns}
        onEdit={handleUpdate}
        onDelete={handleDelete}
        formFields={orcamentoFormFields}
      />
    </>
  );
};

export default Page;

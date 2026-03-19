"use client";
import React, { useState, useEffect } from "react";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
import { instituicaoService } from "@/hooks/instituicao";
import { orcamentoService } from "@/hooks/orcamento";
import { tipoDespesaService } from "@/hooks/tipoDespesa";
import InstituicaoDTO from "@/models/instituicao";
import OrcamentoDTO from "@/models/orcamento";
import TipoDespesaDTO from "@/models/tipoDespesa";
import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";

// Usando o tipo do service
type Orcamento = OrcamentoDTO;

const novoOrcamento: Orcamento = {
  idOrcamento: 0,
  ano: 0,
  anoOrcamento: undefined,
  valor: 0,
  valorOrcamento: undefined,
  idInstituicao: undefined,
  idTipoDespesa: undefined,
  situacao: 1,
};

const validatePositiveInteger = (value: unknown, label: string): string | undefined => {
  const numericValue = Number(value);

  if (!Number.isInteger(numericValue) || numericValue <= 0) {
    return `${label} deve ser um numero inteiro maior que 0.`;
  }

  return undefined;
};

const validatePositiveNumber = (value: unknown, label: string): string | undefined => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return `${label} deve ser maior que 0.`;
  }

  return undefined;
};

const columns = [
  { id: "idOrcamento", label: "ID Orçamento" },
  { id: "anoOrcamento", label: "Ano" },
  { id: "valorOrcamento", label: "Valor" },
  { id: "idInstituicao", label: "ID Instituição" },
  { id: "idTipoDespesa", label: "ID Tipo Despesa" },
  { id: "situacao", label: "Situação" },
];

const camposConst: FieldConfig[] = [
  { key: "anoOrcamento", placeholder: "Ano", local: "principal" },
  { key: "valorOrcamento", placeholder: "Valor", local: "principal" },
  { key: "idInstituicao", placeholder: "ID Instituição", local: "filtro" },
  { key: "idTipoDespesa", placeholder: "ID Tipo Despesa", local: "filtro" },
];

const toOrcamentoPayload = (data: Partial<Orcamento>, id?: number): Partial<Orcamento> => {
  const anoOrcamento = Number(data.anoOrcamento ?? data.ano);
  const valorOrcamento = Number(data.valorOrcamento ?? data.valor);
  const idInstituicao = Number(data.idInstituicao);
  const idTipoDespesa = Number(data.idTipoDespesa);

  return {
    ...(id !== undefined ? { idOrcamento: id, id } : {}),
    anoOrcamento,
    valorOrcamento,
    idInstituicao,
    idTipoDespesa,
    situacao: Number(data.situacao ?? 1),
  };
};

const Page = () => {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [instituicoes, setInstituicoes] = useState<InstituicaoDTO[]>([]);
  const [tiposDespesa, setTiposDespesa] = useState<TipoDespesaDTO[]>([]);
  const [filteredData, setFilteredData] = useState<Orcamento[]>([]);
  const [campos, setCampos] = useState<FieldConfig[]>(camposConst);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orcamentoFormFields: ModalFieldConfig[] = [
    { key: "idOrcamento", hidden: true },
    {
      key: "anoOrcamento",
      label: "Ano",
      placeholder: "Digite o ano",
      required: true,
      type: "number",
      validate: (value) => validatePositiveInteger(value, "Ano"),
    },
    {
      key: "valorOrcamento",
      label: "Valor",
      placeholder: "Digite o valor do orçamento",
      required: true,
      type: "number",
      validate: (value) => validatePositiveNumber(value, "Valor"),
    },
    {
      key: "idInstituicao",
      label: "Instituição",
      placeholder: "Selecione a instituição",
      required: true,
      type: "select",
      validate: (value) => validatePositiveInteger(value, "Instituição"),
      options: instituicoes.map((item) => ({
        value: String(item.id),
        label: `${item.id} - ${item.nome}`,
      })),
    },
    {
      key: "idTipoDespesa",
      label: "Tipo de Despesa",
      placeholder: "Selecione o tipo de despesa",
      required: true,
      type: "select",
      validate: (value) => validatePositiveInteger(value, "Tipo de Despesa"),
      options: tiposDespesa.map((item) => ({
        value: String(item.id),
        label: `${item.id} - ${item.descricao}`,
      })),
    },
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
  ];

  const loadOrcamentos = async () => {
    try {
      setLoading(true);
      const [list, instituicoesData, tiposDespesaData] = await Promise.all([
        orcamentoService.getAllData(),
        instituicaoService.getAllData(),
        tipoDespesaService.getAllData(),
      ]);
      setOrcamentos(list);
      setInstituicoes(instituicoesData);
      setTiposDespesa(tiposDespesaData);
      setFilteredData(list);
      setError(null);
    } catch (err) {
      console.error("Erro ao carregar orçamentos:", err);
      setOrcamentos([]);
      setInstituicoes([]);
      setTiposDespesa([]);
      setFilteredData([]);
      setError("Erro ao carregar dados dos orçamentos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrcamentos();
  }, []);

  // Função para criar novo orçamento
  const handleCreate = async (novoOrcamentoData: Omit<Orcamento, "idOrcamento">) => {
    try {
      const payload = toOrcamentoPayload(novoOrcamentoData);

      if (!payload.anoOrcamento || payload.anoOrcamento <= 0) {
        throw new Error("Informe um ano de orçamento valido (maior que 0).");
      }

      if (!payload.valorOrcamento || payload.valorOrcamento <= 0) {
        throw new Error("Informe um valor de orçamento valido (maior que 0).");
      }

      if (!payload.idInstituicao || !payload.idTipoDespesa) {
        throw new Error("Informe IDs validos para Instituicao e Tipo Despesa (maiores que 0).");
      }

      const instituicaoExiste = instituicoes.some((item) => item.id === payload.idInstituicao);
      if (!instituicaoExiste) {
        throw new Error("A instituição selecionada não existe na base.");
      }

      const tipoDespesaExiste = tiposDespesa.some((item) => item.id === payload.idTipoDespesa);
      if (!tipoDespesaExiste) {
        throw new Error("O tipo de despesa selecionado não existe na base.");
      }

      const created = await orcamentoService.createData(payload);
      await loadOrcamentos();
      return created;
    } catch (err) {
      console.error("Erro ao criar orçamento:", err);
      throw err;
    }
  };

  // Função para atualizar orçamento
  const handleUpdate = async (id: number, dadosAtualizados: Partial<Orcamento>) => {
    try {
      const payload = toOrcamentoPayload(dadosAtualizados, id);

      if (!payload.anoOrcamento || payload.anoOrcamento <= 0) {
        throw new Error("Informe um ano de orçamento valido (maior que 0).");
      }

      if (!payload.valorOrcamento || payload.valorOrcamento <= 0) {
        throw new Error("Informe um valor de orçamento valido (maior que 0).");
      }

      if (!payload.idInstituicao || !payload.idTipoDespesa) {
        throw new Error("Informe IDs validos para Instituicao e Tipo Despesa (maiores que 0).");
      }

      const instituicaoExiste = instituicoes.some((item) => item.id === payload.idInstituicao);
      if (!instituicaoExiste) {
        throw new Error("A instituição selecionada não existe na base.");
      }

      const tipoDespesaExiste = tiposDespesa.some((item) => item.id === payload.idTipoDespesa);
      if (!tipoDespesaExiste) {
        throw new Error("O tipo de despesa selecionado não existe na base.");
      }

      const updated = await orcamentoService.updateData(id, payload);
      await loadOrcamentos();
      return updated;
    } catch (err) {
      console.error("Erro ao atualizar orçamento:", err);
      throw err;
    }
  };

  // Função para deletar orçamento
  const handleDelete = async (id: number) => {
    try {
      await orcamentoService.delete(id);
      await loadOrcamentos();
    } catch (err) {
      console.error("Erro ao deletar orçamento:", err);
      throw err;
    }
  };

  if (loading) {
    return <div>Carregando orçamentos...</div>;
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
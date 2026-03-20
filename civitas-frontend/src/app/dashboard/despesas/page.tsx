"use client";
import React, { useEffect, useState } from "react";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
import { despesaService } from "@/hooks/despesa";
import { fornecedorService } from "@/hooks/fornecedor";
import { instituicaoService } from "@/hooks/instituicao";
import { orcamentoService } from "@/hooks/orcamento";
import { tipoDespesaService } from "@/hooks/tipoDespesa";
import { usuarioService } from "@/hooks/usuario";
import DespesaDTO from "@/models/despesa";
import FornecedorDTO from "@/models/fornecedor";
import InstituicaoDTO from "@/models/instituicao";
import OrcamentoDTO from "@/models/orcamento";
import TipoDespesaDTO from "@/models/tipoDespesa";
import UsuarioDTO from "@/models/usuario";
import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";

type Despesa = DespesaDTO;

const novaDespesa: Despesa = {
  id: 0,
  numeroDocumento: "",
  uc: "",
  dataEmicao: "",
  consumoPrevisto: 0,
  dataVencimento: "",
  situacao: 1,
  idTipoDespesa: undefined,
  idOrcamento: undefined,
  idInstituicao: undefined,
  idFornecedor: undefined,
  idUsuario: undefined,
};

const columns = [
  { id: "id", label: "ID" },
  { id: "numeroDocumento", label: "Numero Documento" },
  { id: "uc", label: "UC" },
  { id: "consumoPrevisto", label: "Consumo Previsto" },
  { id: "dataVencimento", label: "Data Vencimento" },
  { id: "idOrcamento", label: "ID Orcamento" },
  { id: "situacao", label: "Situação" },
];

const camposConst: FieldConfig[] = [
  { key: "numeroDocumento", placeholder: "Numero Documento", local: "principal" },
  { key: "uc", placeholder: "UC", local: "principal" },
  { key: "situacao", placeholder: "Situação", local: "filtro" },
  { key: "dataVencimento", placeholder: "Data Vencimento", local: "filtro" },
];

const toPositiveNumber = (value: unknown): number | undefined => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue <= 0) return undefined;
  return numericValue;
};

const buildNumeroDocumento = (value?: string): string => {
  const base = (value || "DESPESA").trim().replace(/\s+/g, "-").toUpperCase();
  return `${base}-${Date.now()}`;
};

const toDespesaPayload = (data: Partial<Despesa>, id?: number): Partial<Despesa> => ({
  ...(id !== undefined ? { id } : {}),
  numeroDocumento: buildNumeroDocumento(data.numeroDocumento),
  uc: String(data.uc ?? "").trim(),
  dataEmicao: data.dataEmicao || data.dataVencimento,
  consumoPrevisto: Number(data.consumoPrevisto ?? data.valor ?? 0),
  dataVencimento: String(data.dataVencimento ?? ""),
  situacao: Number(data.situacao ?? 1),
  idTipoDespesa: toPositiveNumber(data.idTipoDespesa),
  idOrcamento: toPositiveNumber(data.idOrcamento),
  idInstituicao: toPositiveNumber(data.idInstituicao),
  idFornecedor: toPositiveNumber(data.idFornecedor ?? data.fornecedorId),
  idUsuario: toPositiveNumber(data.idUsuario),
});

export default function Page() {
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [filteredData, setFilteredData] = useState<Despesa[]>([]);
  const [instituicoes, setInstituicoes] = useState<InstituicaoDTO[]>([]);
  const [tiposDespesa, setTiposDespesa] = useState<TipoDespesaDTO[]>([]);
  const [orcamentos, setOrcamentos] = useState<OrcamentoDTO[]>([]);
  const [fornecedores, setFornecedores] = useState<FornecedorDTO[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioDTO[]>([]);
  const [campos, setCampos] = useState<FieldConfig[]>(camposConst);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const despesaFormFields: ModalFieldConfig[] = [
    { key: "id", hidden: true },
    {
      key: "numeroDocumento",
      label: "Numero Documento",
      placeholder: "Numero do documento",
      required: true,
    },
    {
      key: "uc",
      label: "UC",
      placeholder: "Unidade Consumidora",
      required: true,
    },
    {
      key: "dataVencimento",
      label: "Data Vencimento",
      type: "date",
      required: true,
    },
    {
      key: "consumoPrevisto",
      label: "Consumo Previsto",
      type: "number",
      required: true,
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
    {
      key: "idTipoDespesa",
      label: "Tipo de Despesa",
      type: "select",
      required: true,
      options: tiposDespesa.map((item) => ({
        value: String(item.id),
        label: `${item.id} - ${item.descricao}`,
      })),
    },
    {
      key: "idOrcamento",
      label: "Orçamento",
      type: "select",
      required: true,
      options: orcamentos.map((item) => ({
        value: String(item.idOrcamento),
        label: `${item.idOrcamento} - Ano ${item.anoOrcamento ?? item.ano}`,
      })),
    },
    {
      key: "idInstituicao",
      label: "Instituição",
      type: "select",
      required: true,
      options: instituicoes.map((item) => ({
        value: String(item.id),
        label: `${item.id} - ${item.nome}`,
      })),
    },
    {
      key: "idFornecedor",
      label: "Fornecedor",
      type: "select",
      options: fornecedores.map((item) => ({
        value: String(item.idFornecedor),
        label: `${item.idFornecedor} - ${item.nomeFantasia}`,
      })),
    },
    {
      key: "idUsuario",
      label: "Usuário",
      type: "select",
      options: usuarios.map((item) => ({
        value: String(item.id),
        label: `${item.id} - ${item.nome}`,
      })),
    },
  ];

  const loadDespesas = async () => {
    try {
      setLoading(true);
      const [
        despesasData,
        instituicoesData,
        tiposDespesaData,
        orcamentosData,
        fornecedoresData,
        usuariosData,
      ] = await Promise.all([
        despesaService.getAllData(),
        instituicaoService.getAllData(),
        tipoDespesaService.getAllData(),
        orcamentoService.getAllData(),
        fornecedorService.getAllData(),
        usuarioService.getAllData(),
      ]);

      setDespesas(despesasData);
      setFilteredData(despesasData);
      setInstituicoes(instituicoesData);
      setTiposDespesa(tiposDespesaData);
      setOrcamentos(orcamentosData);
      setFornecedores(fornecedoresData);
      setUsuarios(usuariosData);
      setError(null);
    } catch (err) {
      console.error("Erro ao carregar despesas:", err);
      setDespesas([]);
      setFilteredData([]);
      setInstituicoes([]);
      setTiposDespesa([]);
      setOrcamentos([]);
      setFornecedores([]);
      setUsuarios([]);
      setError("Não foi possível carregar despesas. Verifique o backend e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (novaDespesaData: Omit<Despesa, "id">) => {
    const payload = toDespesaPayload(novaDespesaData);

    if (!payload.uc || !payload.dataVencimento || !payload.idTipoDespesa || !payload.idOrcamento || !payload.idInstituicao) {
      throw new Error("Preencha os campos obrigatorios de despesa (UC, vencimento, tipo, orcamento e instituicao).");
    }

    const created = await despesaService.createData(payload);
    await loadDespesas();
    return created;
  };

  const handleUpdate = async (id: number, dadosAtualizados: Partial<Despesa>) => {
    const payload = toDespesaPayload(dadosAtualizados, id);

    if (!payload.uc || !payload.dataVencimento || !payload.idTipoDespesa || !payload.idOrcamento || !payload.idInstituicao) {
      throw new Error("Preencha os campos obrigatorios de despesa (UC, vencimento, tipo, orcamento e instituicao).");
    }

    const updated = await despesaService.updateData(id, payload);
    await loadDespesas();
    return updated;
  };

  const handleDelete = async (id: number) => {
    await despesaService.alterarSituacao(id);
    await loadDespesas();
  };

  useEffect(() => {
    void loadDespesas();
  }, []);

  if (loading) {
    return <div>Carregando despesas...</div>;
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          {error}
        </div>
      )}

      <SearchBar
        model={novaDespesa}
        dados={despesas}
        setDados={setFilteredData}
        campos={campos}
        setCampos={setCampos}
        onCadastrar={handleCreate}
        formFields={despesaFormFields}
        formHiddenFields={["id"]}
      />

      <Table
        data={filteredData}
        columns={columns}
        onEdit={handleUpdate}
        onDelete={handleDelete}
        formFields={despesaFormFields}
        formHiddenFields={["id"]}
      />
    </>
  );
}

"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
import { normalizeOrcamentoPayload } from "@/global/formPayload";
import { getSituacaoLabel, SITUACAO_INATIVO } from "@/global/situacao";
import { despesaService } from "@/hooks/despesa";
import { instituicaoService } from "@/hooks/instituicao";
import { orcamentoService } from "@/hooks/orcamento";
import { tipoDespesaService } from "@/hooks/tipoDespesa";
import DespesaDTO from "@/models/despesa";
import InstituicaoDTO from "@/models/instituicao";
import OrcamentoDTO from "@/models/orcamento";
import TipoDespesaDTO from "@/models/tipoDespesa";
import OrcamentoDetailsView from "./OrcamentoDetailsView";

type Orcamento = OrcamentoDTO;
type Despesa = DespesaDTO;
type Instituicao = InstituicaoDTO;
type TipoDespesa = TipoDespesaDTO;
export type OrcamentoRow = Orcamento & {
  instituicaoLabel: string;
  tipoDespesaLabel: string;
  valorPrevisto: number;
  valorRealizado: number;
  saldo: number;
  valorPrevistoFormatado: string;
  valorRealizadoFormatado: string;
  saldoFormatado: string;
  quantidadeDespesasRelacionadas: number;
};

type OrcamentoPageData = {
  orcamentos: Orcamento[];
  despesas: Despesa[];
  instituicoes: Instituicao[];
  tiposDespesa: TipoDespesa[];
};

const novoOrcamento = {
  idOrcamento: 0,
  anoOrcamento: "",
  valorOrcamento: "",
  idInstituicao: "",
  idTipoDespesa: "",
  situacao: 1,
};

const columns = [
  { id: "anoOrcamento", label: "Ano" },
  { id: "valorOrcamento", label: "Valor" },
  { id: "instituicaoLabel", label: "Instituicao" },
  { id: "tipoDespesaLabel", label: "Tipo de Despesa" },
];

const buildOrcamentoCampos = (
  instituicaoOptions: FieldConfig["options"],
  tipoDespesaOptions: FieldConfig["options"]
): FieldConfig[] => {
  return [
    { key: "anoOrcamento", placeholder: "Ano", local: "principal" },
    { key: "valorOrcamento", placeholder: "Valor", local: "principal" },
    {
      key: "idInstituicao",
      placeholder: "Instituicao",
      local: "filtro",
      type: "select",
      options: instituicaoOptions,
    },
    {
      key: "idTipoDespesa",
      placeholder: "Tipo de Despesa",
      local: "filtro",
      type: "select",
      options: tipoDespesaOptions,
    },
  ];
};

const buildLookupLabel = (label: string, situacao?: number): string => {
  if (situacao === SITUACAO_INATIVO) {
    return `${label} (${getSituacaoLabel(situacao)})`;
  }

  return label;
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const getOrcamentoId = (orcamento: Orcamento): number => {
  return Number(orcamento.idOrcamento ?? orcamento.id ?? 0);
};

const getOrcamentoValorPrevisto = (orcamento: Orcamento): number => {
  const value = Number(orcamento.valorOrcamento ?? orcamento.valor ?? 0);
  return Number.isFinite(value) ? value : 0;
};

const getDespesaValorRealizado = (despesa: Despesa): number => {
  const value = Number(
    despesa.valorPago ?? despesa.valor ?? despesa.valorPrevisto ?? despesa.consumoPrevisto ?? 0
  );
  return Number.isFinite(value) ? value : 0;
};

const loadDespesasSafely = async (): Promise<Despesa[]> => {
  try {
    return await despesaService.getAllStatusData();
  } catch (error) {
    console.error("Erro ao carregar despesas vinculadas aos orcamentos:", error);
    return [];
  }
};

const validatePositiveNumber = (fieldLabel: string): ModalFieldConfig["validate"] => {
  return (value: unknown) => {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }

    const numericValue = Number(value);
    if (Number.isNaN(numericValue) || numericValue <= 0) {
      return `${fieldLabel} deve ser maior que zero.`;
    }

    return undefined;
  };
};

const mapOrcamentoRows = (
  orcamentos: Orcamento[],
  despesas: Despesa[],
  instituicoes: Instituicao[],
  tiposDespesa: TipoDespesa[]
): OrcamentoRow[] => {
  const instituicaoMap = new Map(
    instituicoes.map((instituicao) => [instituicao.id, instituicao.nome] as const)
  );
  const tipoDespesaMap = new Map(
    tiposDespesa.map((tipoDespesa) => [tipoDespesa.id, tipoDespesa.descricao] as const)
  );

  return orcamentos.map((orcamento) => {
    const orcamentoId = getOrcamentoId(orcamento);
    const instituicaoId = orcamento.idInstituicao;
    const tipoDespesaId = orcamento.idTipoDespesa;
    const despesasRelacionadas = despesas.filter(
      (despesa) => Number(despesa.idOrcamento ?? 0) === orcamentoId
    );
    const valorPrevisto = getOrcamentoValorPrevisto(orcamento);
    const valorRealizado = despesasRelacionadas.reduce(
      (total, despesa) => total + getDespesaValorRealizado(despesa),
      0
    );
    const saldo = valorPrevisto - valorRealizado;

    return {
      ...orcamento,
      valorPrevisto,
      valorRealizado,
      saldo,
      valorPrevistoFormatado: formatCurrency(valorPrevisto),
      valorRealizadoFormatado: formatCurrency(valorRealizado),
      saldoFormatado: formatCurrency(saldo),
      quantidadeDespesasRelacionadas: despesasRelacionadas.length,
      instituicaoLabel:
        instituicaoId !== undefined
          ? instituicaoMap.get(instituicaoId) ?? `Instituicao #${instituicaoId}`
          : "Instituicao nao informada",
      tipoDespesaLabel:
        tipoDespesaId !== undefined
          ? tipoDespesaMap.get(tipoDespesaId) ?? `Tipo #${tipoDespesaId}`
          : "Tipo nao informado",
    };
  });
};

const fetchOrcamentoPageData = async (): Promise<OrcamentoPageData> => {
  const [orcamentos, despesas, instituicoes, tiposDespesa] = await Promise.all([
    orcamentoService.getAll(),
    loadDespesasSafely(),
    instituicaoService.getAll(),
    tipoDespesaService.getAll(),
  ]);

  return {
    orcamentos,
    despesas,
    instituicoes,
    tiposDespesa,
  };
};

type OrcamentosPageClientProps = {
  initialData: OrcamentoPageData;
  initialError?: string | null;
};

export default function OrcamentosPageClient({
  initialData,
  initialError = null,
}: OrcamentosPageClientProps) {
  const initialRows = mapOrcamentoRows(
    initialData.orcamentos,
    initialData.despesas,
    initialData.instituicoes,
    initialData.tiposDespesa
  );
  const initialInstituicaoOptions = initialData.instituicoes.map((instituicao) => ({
    value: instituicao.id,
    label: buildLookupLabel(instituicao.nome, instituicao.situacao),
  }));
  const initialTipoDespesaOptions = initialData.tiposDespesa.map((tipoDespesa) => ({
    value: tipoDespesa.id,
    label: buildLookupLabel(tipoDespesa.descricao, tipoDespesa.situacao),
  }));

  const [orcamentos, setOrcamentos] = useState<OrcamentoRow[]>(initialRows);
  const [filteredData, setFilteredData] = useState<OrcamentoRow[]>(initialRows);
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>(initialData.instituicoes);
  const [tiposDespesa, setTiposDespesa] = useState<TipoDespesa[]>(initialData.tiposDespesa);
  const [campos, setCampos] = useState<FieldConfig[]>(
    buildOrcamentoCampos(initialInstituicaoOptions, initialTipoDespesaOptions)
  );
  const [error, setError] = useState<string | null>(initialError);

  const instituicaoOptions = useMemo(() => {
    return instituicoes.map((instituicao) => ({
      value: instituicao.id,
      label: buildLookupLabel(instituicao.nome, instituicao.situacao),
    }));
  }, [instituicoes]);

  const tipoDespesaOptions = useMemo(() => {
    return tiposDespesa.map((tipoDespesa) => ({
      value: tipoDespesa.id,
      label: buildLookupLabel(tipoDespesa.descricao, tipoDespesa.situacao),
    }));
  }, [tiposDespesa]);

  const orcamentoFormFields = useMemo<ModalFieldConfig[]>(() => {
    return [
      { key: "idOrcamento", hidden: true },
      {
        key: "anoOrcamento",
        label: "Ano",
        placeholder: "Digite o ano",
        required: true,
        type: "number",
        mask: "year",
        validate: validatePositiveNumber("Ano"),
      },
      {
        key: "valorOrcamento",
        label: "Valor",
        placeholder: "Digite o valor do orcamento",
        required: true,
        type: "number",
        mask: "currency",
        validate: validatePositiveNumber("Valor"),
      },
      {
        key: "idInstituicao",
        label: "Instituicao",
        placeholder: "Selecione a instituicao",
        type: "select",
        required: true,
        options: instituicaoOptions,
      },
      {
        key: "idTipoDespesa",
        label: "Tipo de Despesa",
        placeholder: "Selecione o tipo de despesa",
        type: "select",
        required: true,
        options: tipoDespesaOptions,
      },
    ];
  }, [instituicaoOptions, tipoDespesaOptions]);

  const refreshOrcamentos = async () => {
    const pageData = await fetchOrcamentoPageData();
    const rows = mapOrcamentoRows(
      pageData.orcamentos,
      pageData.despesas,
      pageData.instituicoes,
      pageData.tiposDespesa
    );

    setInstituicoes(pageData.instituicoes);
    setTiposDespesa(pageData.tiposDespesa);
    setOrcamentos(rows);
    setFilteredData(rows);
    setError(null);
  };

  useEffect(() => {
    setCampos(buildOrcamentoCampos(instituicaoOptions, tipoDespesaOptions));
  }, [instituicaoOptions, tipoDespesaOptions]);

  const handleCreate = async (data: Omit<Orcamento, "idOrcamento">) => {
    await orcamentoService.create(normalizeOrcamentoPayload(data));
    await refreshOrcamentos();
  };

  const handleUpdate = async (id: number, data: Partial<Orcamento>) => {
    await orcamentoService.update(id, normalizeOrcamentoPayload(data));
    await refreshOrcamentos();
  };

  const handleDelete = async (id: number) => {
    await orcamentoService.delete(id);
    await refreshOrcamentos();
  };

  return (
    <>
      {error && (
        <div className="mb-4 rounded-sm border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          {error}
        </div>
      )}

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
        renderModalExtra={(row, mode) =>
          mode === "view" ? <OrcamentoDetailsView orcamento={row} /> : null
        }
        exportConfig={{
          enabled: true,
          title: "Orcamentos",
          fileName: "orcamentos",
          allData: orcamentos,
        }}
      />
    </>
  );
}

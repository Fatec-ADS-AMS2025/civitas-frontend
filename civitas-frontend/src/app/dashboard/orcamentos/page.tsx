"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
import { normalizeOrcamentoPayload } from "@/global/formPayload";
import { getSituacaoLabel, SITUACAO_INATIVO } from "@/global/situacao";
import { instituicaoService } from "@/hooks/instituicao";
import { orcamentoService } from "@/hooks/orcamento";
import { tipoDespesaService } from "@/hooks/tipoDespesa";
import InstituicaoDTO from "@/models/instituicao";
import OrcamentoDTO from "@/models/orcamento";
import TipoDespesaDTO from "@/models/tipoDespesa";
import OrcamentosSkeleton from "./skeleton";

type Orcamento = OrcamentoDTO;
type Instituicao = InstituicaoDTO;
type TipoDespesa = TipoDespesaDTO;
type OrcamentoRow = Orcamento & {
  instituicaoLabel: string;
  tipoDespesaLabel: string;
};

type OrcamentoPageData = {
  orcamentos: Orcamento[];
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
  { id: "idOrcamento", label: "ID Orcamento" },
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
    const instituicaoId = orcamento.idInstituicao;
    const tipoDespesaId = orcamento.idTipoDespesa;

    return {
      ...orcamento,
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
  const [orcamentos, instituicoes, tiposDespesa] = await Promise.all([
    orcamentoService.getAll(),
    instituicaoService.getAll(),
    tipoDespesaService.getAll(),
  ]);

  return {
    orcamentos,
    instituicoes,
    tiposDespesa,
  };
};

export default function Page() {
  const [orcamentos, setOrcamentos] = useState<OrcamentoRow[]>([]);
  const [filteredData, setFilteredData] = useState<OrcamentoRow[]>([]);
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [tiposDespesa, setTiposDespesa] = useState<TipoDespesa[]>([]);
  const [campos, setCampos] = useState<FieldConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      pageData.instituicoes,
      pageData.tiposDespesa
    );

    setInstituicoes(pageData.instituicoes);
    setTiposDespesa(pageData.tiposDespesa);
    setOrcamentos(rows);
    setFilteredData(rows);
  };

  useEffect(() => {
    setCampos(buildOrcamentoCampos(instituicaoOptions, tipoDespesaOptions));
  }, [instituicaoOptions, tipoDespesaOptions]);

  useEffect(() => {
    const loadOrcamentos = async () => {
      try {
        setLoading(true);
        const pageData = await fetchOrcamentoPageData();
        const rows = mapOrcamentoRows(
          pageData.orcamentos,
          pageData.instituicoes,
          pageData.tiposDespesa
        );

        setInstituicoes(pageData.instituicoes);
        setTiposDespesa(pageData.tiposDespesa);
        setOrcamentos(rows);
        setFilteredData(rows);
        setError(null);
      } catch (err) {
        console.error("Erro ao carregar orcamentos:", err);
        setOrcamentos([]);
        setFilteredData([]);
        setInstituicoes([]);
        setTiposDespesa([]);
        setCampos([]);
        setError(
          "Nao foi possivel carregar os orcamentos. Verifique o backend e tente novamente."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadOrcamentos();
  }, []);

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

  if (loading) {
    return <OrcamentosSkeleton />;
  }

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

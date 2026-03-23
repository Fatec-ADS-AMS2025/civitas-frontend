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
import { instituicaoService } from "@/hooks/instituicao";
import { orcamentoService } from "@/hooks/orcamento";
import { tipoDespesaService } from "@/hooks/tipoDespesa";
import InstituicaoDTO from "@/models/instituicao";
import OrcamentoDTO from "@/models/orcamento";
import { SkeletonTable } from "@/components/skeleton";
import TipoDespesaDTO from "@/models/tipoDespesa";
import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";
import OrcamentoDTO from "@/models/orcamento";
import TipoDespesaDTO from "@/models/tipoDespesa";

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

const buildLookupLabel = (label: string, situacao: number): string => {
  if (situacao === SITUACAO_INATIVO) {
    return `${label} (${getSituacaoLabel(situacao)})`;
  }

  return label;
};

const validatePositiveNumber = (fieldLabel: string) => {
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
    instituicoes.map((instituicao) => [instituicao.id, instituicao.nome])
  );
  const tipoDespesaMap = new Map(
    tiposDespesa.map((tipoDespesa) => [tipoDespesa.id, tipoDespesa.descricao])
  );

  return orcamentos.map((orcamento) => ({
    ...orcamento,
    instituicaoLabel:
      instituicaoMap.get(orcamento.idInstituicao) ??
      `Instituicao #${orcamento.idInstituicao}`,
    tipoDespesaLabel:
      tipoDespesaMap.get(orcamento.idTipoDespesa) ??
      `Tipo #${orcamento.idTipoDespesa}`,
  }));
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
        validate: validatePositiveNumber("Ano"),
      },
      {
        key: "valorOrcamento",
        label: "Valor",
        placeholder: "Digite o valor do orcamento",
        required: true,
        type: "number",
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
      console.error("Erro ao criar orcamento:", err);
      throw err;
    }
  };

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
      console.error("Erro ao atualizar orcamento:", err);
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await orcamentoService.delete(id);
      await loadOrcamentos();
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

  return (
    <>
      {error && (
        <div className="mb-4 rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
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
      />
    </>
  );
}

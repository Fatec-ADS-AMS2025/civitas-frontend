<<<<<<< 103-sprint-13---front---aprimoramento-do-formulário-genérico-fk-etapas-já-implementadas-mas-precisa-de-dupla-validação
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
=======
﻿"use client";
import React, { useState, useEffect } from "react";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
import { orcamentoService } from "@/hooks/orcamento";
>>>>>>> dev
import OrcamentoDTO from "@/models/orcamento";
import TipoDespesaDTO from "@/models/tipoDespesa";

<<<<<<< 103-sprint-13---front---aprimoramento-do-formulário-genérico-fk-etapas-já-implementadas-mas-precisa-de-dupla-validação
type Orcamento = OrcamentoDTO;
type Instituicao = InstituicaoDTO;
type TipoDespesa = TipoDespesaDTO;
type OrcamentoRow = Orcamento & {
  instituicaoLabel: string;
  tipoDespesaLabel: string;
};
=======
type Orcamento = OrcamentoDTO & { idInstituicao?: number };
type ApiOrcamento = Record<string, any>;
>>>>>>> dev

type OrcamentoPageData = {
  orcamentos: Orcamento[];
  instituicoes: Instituicao[];
  tiposDespesa: TipoDespesa[];
};

const novoOrcamento = {
  idOrcamento: 0,
<<<<<<< 103-sprint-13---front---aprimoramento-do-formulário-genérico-fk-etapas-já-implementadas-mas-precisa-de-dupla-validação
  anoOrcamento: "",
  valorOrcamento: "",
  idInstituicao: "",
  idTipoDespesa: "",
=======
  ano: 0,
  valor: 0,
  descricao: "",
  idInstituicao: 0,
>>>>>>> dev
};

const columns = [
  { id: "idOrcamento", label: "ID Orcamento" },
<<<<<<< 103-sprint-13---front---aprimoramento-do-formulário-genérico-fk-etapas-já-implementadas-mas-precisa-de-dupla-validação
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
=======
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
>>>>>>> dev
  };

  if (loading) {
    return <div>Carregando orcamentos...</div>;
<<<<<<< 103-sprint-13---front---aprimoramento-do-formulário-genérico-fk-etapas-já-implementadas-mas-precisa-de-dupla-validação
=======
  }

  if (error) {
    return <div>Erro: {error}</div>;
>>>>>>> dev
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
<<<<<<< 103-sprint-13---front---aprimoramento-do-formulário-genérico-fk-etapas-já-implementadas-mas-precisa-de-dupla-validação
}
=======
};

export default Page;
>>>>>>> dev

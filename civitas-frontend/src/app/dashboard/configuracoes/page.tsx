"use client";

import React, { useEffect, useMemo, useState } from "react";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";
import { getSituacaoLabel, SITUACAO_ATIVO, SITUACAO_OPTIONS } from "@/global/situacao";
import { tipoInstituicaoService } from "@/hooks/tipoInstituicao";
import { tipoDespesaService } from "@/hooks/tipoDespesa";
import { tipoCodigoService } from "@/hooks/tipoCodigo";
import { unidadeMedidaService } from "@/hooks/unidadeMedida";
import TipoCodigoDTO from "@/models/tipoCodigo";
import TipoInstituicaoDTO from "@/models/tipoInstituicao";
import TipoDespesaDTO from "@/models/tipoDespesa";
import UnidadeMedidaDTO from "@/models/unidadeMedida";
import ConfiguracoesSkeleton from "./skeleton";

type ConfigKind = "tipoCodigo" | "tipoInstituicao" | "tipoDespesa" | "unidadeMedida";
type FeedbackType = "success" | "error";

type FeedbackState = {
  type: FeedbackType;
  message: string;
} | null;

type TipoInstituicaoRow = TipoInstituicaoDTO & {
  situacaoLabel: string;
};

type TipoCodigoRow = TipoCodigoDTO;

type UnidadeMedidaRow = UnidadeMedidaDTO & {
  situacaoLabel: string;
};

type TipoDespesaRow = TipoDespesaDTO & {
  situacaoLabel: string;
  solicitaUcLabel: string;
  unidadeMedidaLabel: string;
};

type ConfigRow = TipoCodigoRow | TipoInstituicaoRow | UnidadeMedidaRow | TipoDespesaRow;

type ConfigDefinition = {
  key: ConfigKind;
  label: string;
  columns: { id: string; label: string }[];
  buildFields: (unidades: UnidadeMedidaDTO[], tipoCodigos: TipoCodigoDTO[]) => ModalFieldConfig[];
  buildSearchFields: () => FieldConfig[];
  emptyModel: Record<string, unknown>;
};

const SOLICITA_UC_OPTIONS = [
  { value: 1, label: "Sim" },
  { value: 2, label: "Nao" },
];

const tipoInstituicaoColumns = [
  { id: "id", label: "ID" },
  { id: "descricao", label: "Descricao" },
  { id: "situacaoLabel", label: "Situacao" },
];

const tipoCodigoColumns = [
  { id: "id", label: "ID" },
  { id: "nome", label: "Nome" },
  { id: "descricao", label: "Descricao" },
];

const tipoDespesaColumns = [
  { id: "id", label: "ID" },
  { id: "descricao", label: "Descricao" },
  { id: "solicitaUcLabel", label: "Solicita UC" },
  { id: "unidadeMedidaLabel", label: "Unidade de Medida" },
  { id: "situacaoLabel", label: "Situacao" },
];

const unidadeMedidaColumns = [
  { id: "id", label: "ID" },
  { id: "descricao", label: "Descricao" },
  { id: "abreviatura", label: "Abreviatura" },
  { id: "situacaoLabel", label: "Situacao" },
];

const normalizeText = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const asErrorMessage = (error: unknown, fallback: string): string => {
  if (!(error instanceof Error)) return fallback;

  const match = error.message.match(/HTTP\s+\d+:\s*(.*)$/i);
  if (match?.[1]) return match[1];

  return error.message || fallback;
};

const mergeById = <T extends { id: number }>(activeItems: T[], inactiveItems: T[]): T[] => {
  const map = new Map<number, T>();

  activeItems.forEach((item) => map.set(item.id, item));
  inactiveItems.forEach((item) => {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  });

  return Array.from(map.values());
};

const mapTipoInstituicaoRows = (items: TipoInstituicaoDTO[]): TipoInstituicaoRow[] => {
  return items.map((item) => ({
    ...item,
    situacaoLabel: getSituacaoLabel(item.situacao),
  }));
};

const mapTipoCodigoRows = (items: TipoCodigoDTO[]): TipoCodigoRow[] => {
  return items.map((item) => ({
    ...item,
  }));
};

const mapUnidadeRows = (items: UnidadeMedidaDTO[]): UnidadeMedidaRow[] => {
  return items.map((item) => ({
    ...item,
    situacaoLabel: getSituacaoLabel(item.situacao),
  }));
};

const mapTipoDespesaRows = (
  items: TipoDespesaDTO[],
  unidadesMedida: UnidadeMedidaDTO[]
): TipoDespesaRow[] => {
  const unidadeMap = new Map(unidadesMedida.map((item) => [item.id, item.descricao]));

  return items.map((item) => ({
    ...item,
    situacaoLabel: getSituacaoLabel(item.situacao),
    solicitaUcLabel: item.solicitaUc === 1 ? "Sim" : "Nao",
    unidadeMedidaLabel:
      unidadeMap.get(item.idUnidadeMedida) ?? `Unidade #${item.idUnidadeMedida}`,
  }));
};

const CONFIG_DEFINITIONS: Record<ConfigKind, ConfigDefinition> = {
  tipoCodigo: {
    key: "tipoCodigo",
    label: "Tipo de Codigo",
    columns: tipoCodigoColumns,
    buildFields: () => [
      { key: "id", hidden: true },
      {
        key: "nome",
        label: "Nome",
        placeholder: "Informe o nome",
        required: true,
      },
      {
        key: "descricao",
        label: "Descricao",
        placeholder: "Informe a descricao",
        type: "textarea",
        required: true,
      },
    ],
    buildSearchFields: () => [
      { key: "nome", placeholder: "Nome", local: "principal" },
      { key: "descricao", placeholder: "Descricao", local: "filtro" },
    ],
    emptyModel: {
      id: 0,
      nome: "",
      descricao: "",
    },
  },
  tipoInstituicao: {
    key: "tipoInstituicao",
    label: "Tipo de Instituicao",
    columns: tipoInstituicaoColumns,
    buildFields: () => [
      { key: "id", hidden: true },
      {
        key: "descricao",
        label: "Descricao",
        placeholder: "Informe a descricao",
        required: true,
      },
      {
        key: "situacao",
        label: "Situacao",
        type: "select",
        options: SITUACAO_OPTIONS,
        required: true,
      },
    ],
    buildSearchFields: () => [
      { key: "descricao", placeholder: "Descricao", local: "principal" },
      {
        key: "situacaoLabel",
        placeholder: "Situacao",
        local: "filtro",
        type: "select",
        options: [
          { value: "Ativo", label: "Ativo" },
          { value: "Inativo", label: "Inativo" },
        ],
      },
    ],
    emptyModel: {
      id: 0,
      descricao: "",
      situacao: SITUACAO_ATIVO,
    },
  },
  tipoDespesa: {
    key: "tipoDespesa",
    label: "Tipo de Despesa",
    columns: tipoDespesaColumns,
    buildFields: (unidades, tipoCodigos) => [
      { key: "id", hidden: true },
      {
        key: "descricao",
        label: "Descricao",
        placeholder: "Informe a descricao",
        required: true,
      },
      {
        key: "solicitaUc",
        label: "Solicita UC",
        type: "select",
        options: SOLICITA_UC_OPTIONS,
        required: true,
      },
      {
        key: "idTipoCodigo",
        label: "Tipo de Codigo",
        placeholder: "Selecione o tipo de codigo",
        type: "select",
        options: tipoCodigos.map((item) => ({
          value: item.id,
          label: item.nome,
        })),
        required: true,
      },
      {
        key: "idUnidadeMedida",
        label: "Unidade de Medida",
        placeholder: "Selecione a unidade de medida",
        type: "select",
        options: unidades.map((item) => ({
          value: item.id,
          label: item.situacao === SITUACAO_ATIVO ? item.descricao : `${item.descricao} (Inativo)`,
        })),
        required: true,
      },
      {
        key: "situacao",
        label: "Situacao",
        type: "select",
        options: SITUACAO_OPTIONS,
        required: true,
      },
    ],
    buildSearchFields: () => [
      { key: "descricao", placeholder: "Descricao", local: "principal" },
      {
        key: "situacaoLabel",
        placeholder: "Situacao",
        local: "filtro",
        type: "select",
        options: [
          { value: "Ativo", label: "Ativo" },
          { value: "Inativo", label: "Inativo" },
        ],
      },
    ],
    emptyModel: {
      id: 0,
      descricao: "",
      solicitaUc: 1,
      idTipoCodigo: "",
      idUnidadeMedida: "",
      situacao: SITUACAO_ATIVO,
    },
  },
  unidadeMedida: {
    key: "unidadeMedida",
    label: "Unidade de Medida",
    columns: unidadeMedidaColumns,
    buildFields: () => [
      { key: "id", hidden: true },
      {
        key: "descricao",
        label: "Descricao",
        placeholder: "Informe a descricao",
        required: true,
      },
      {
        key: "abreviatura",
        label: "Abreviatura",
        placeholder: "Ex.: kWh",
        required: true,
      },
      {
        key: "situacao",
        label: "Situacao",
        type: "select",
        options: SITUACAO_OPTIONS,
        required: true,
      },
    ],
    buildSearchFields: () => [
      { key: "descricao", placeholder: "Descricao", local: "principal" },
      {
        key: "situacaoLabel",
        placeholder: "Situacao",
        local: "filtro",
        type: "select",
        options: [
          { value: "Ativo", label: "Ativo" },
          { value: "Inativo", label: "Inativo" },
        ],
      },
    ],
    emptyModel: {
      id: 0,
      descricao: "",
      abreviatura: "",
      situacao: SITUACAO_ATIVO,
    },
  },
};

export default function ConfiguracoesPage() {
  const [tipoSelecionado, setTipoSelecionado] = useState<ConfigKind>("tipoInstituicao");
  const [campos, setCampos] = useState<FieldConfig[]>(
    CONFIG_DEFINITIONS.tipoInstituicao.buildSearchFields()
  );
  const [dadosOriginais, setDadosOriginais] = useState<ConfigRow[]>([]);
  const [dadosFiltrados, setDadosFiltrados] = useState<ConfigRow[]>([]);
  const [unidadesMedida, setUnidadesMedida] = useState<UnidadeMedidaDTO[]>([]);
  const [tipoCodigos, setTipoCodigos] = useState<TipoCodigoDTO[]>([]);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [loading, setLoading] = useState(true);

  const definition = useMemo(() => CONFIG_DEFINITIONS[tipoSelecionado], [tipoSelecionado]);

  const formFields = useMemo(
    () => definition.buildFields(unidadesMedida, tipoCodigos),
    [definition, tipoCodigos, unidadesMedida]
  );

  const loadUnidadesAll = async () => {
    const [ativas, inativas] = await Promise.all([
      unidadeMedidaService.getAll(),
      unidadeMedidaService.getInactive(),
    ]);

    setUnidadesMedida(mergeById(ativas, inativas));
  };

  const fetchTipoInstituicaoData = async () => {
    const [ativas, inativas] = await Promise.all([
      tipoInstituicaoService.getAll(),
      tipoInstituicaoService.getInactive(),
    ]);

    return mergeById(ativas, inativas);
  };

  const fetchTipoCodigoData = async () => {
    return tipoCodigoService.getAll();
  };

  const loadTipoCodigosAll = async () => {
    const items = await fetchTipoCodigoData();
    setTipoCodigos(items);
  };

  const fetchTipoDespesaData = async () => {
    const [ativas, inativas] = await Promise.all([
      tipoDespesaService.getAll(),
      tipoDespesaService.getInactive(),
    ]);

    return mergeById(ativas, inativas);
  };

  const fetchUnidadeData = async () => {
    const [ativas, inativas] = await Promise.all([
      unidadeMedidaService.getAll(),
      unidadeMedidaService.getInactive(),
    ]);

    return mergeById(ativas, inativas);
  };

  const refreshData = async (selectedKind: ConfigKind) => {
    setLoading(true);

    try {
      if (selectedKind === "tipoCodigo") {
        const items = await fetchTipoCodigoData();
        const rows = mapTipoCodigoRows(items);
        setDadosOriginais(rows);
        setDadosFiltrados(rows);
      }

      if (selectedKind === "tipoInstituicao") {
        const items = await fetchTipoInstituicaoData();
        const rows = mapTipoInstituicaoRows(items);
        setDadosOriginais(rows);
        setDadosFiltrados(rows);
      }

      if (selectedKind === "tipoDespesa") {
        await Promise.all([loadUnidadesAll(), loadTipoCodigosAll()]);

        const [tiposDespesa, unidades] = await Promise.all([
          fetchTipoDespesaData(),
          unidadeMedidaService.getAll(),
        ]);

        const rows = mapTipoDespesaRows(tiposDespesa, unidades);
        setDadosOriginais(rows);
        setDadosFiltrados(rows);
      }

      if (selectedKind === "unidadeMedida") {
        const items = await fetchUnidadeData();
        const rows = mapUnidadeRows(items);
        setDadosOriginais(rows);
        setDadosFiltrados(rows);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCampos(definition.buildSearchFields());
  }, [definition]);

  useEffect(() => {
    const load = async () => {
      setFeedback(null);

      try {
        await refreshData(tipoSelecionado);
      } catch (error) {
        setDadosOriginais([]);
        setDadosFiltrados([]);
        setFeedback({
          type: "error",
          message: asErrorMessage(error, "Nao foi possivel carregar os dados de configuracoes."),
        });
      }
    };

    void load();
  }, [tipoSelecionado]);

  const handleCreate = async (formData: Record<string, unknown>) => {
    setFeedback(null);

    try {
      if (tipoSelecionado === "tipoCodigo") {
        const payload: Omit<TipoCodigoDTO, "id"> = {
          nome: normalizeText(formData.nome),
          descricao: normalizeText(formData.descricao),
        };

        const result = await tipoCodigoService.createEnvelope(payload);
        setFeedback({
          type: "success",
          message: result.message ?? "Tipo de codigo cadastrado com sucesso.",
        });
      }

      if (tipoSelecionado === "tipoInstituicao") {
        const payload: Omit<TipoInstituicaoDTO, "id"> = {
          descricao: normalizeText(formData.descricao),
          situacao: toNumber(formData.situacao, SITUACAO_ATIVO),
        };

        const result = await tipoInstituicaoService.createEnvelope(payload);
        setFeedback({
          type: "success",
          message: result.message ?? "Tipo de instituicao cadastrado com sucesso.",
        });
      }

      if (tipoSelecionado === "tipoDespesa") {
        const payload: Omit<TipoDespesaDTO, "id"> = {
          descricao: normalizeText(formData.descricao),
          solicitaUc: toNumber(formData.solicitaUc, 1),
          situacao: toNumber(formData.situacao, SITUACAO_ATIVO),
          idTipoCodigo: toNumber(formData.idTipoCodigo),
          idUnidadeMedida: toNumber(formData.idUnidadeMedida),
        };

        const result = await tipoDespesaService.createEnvelope(payload);
        setFeedback({
          type: "success",
          message: result.message ?? "Tipo de despesa cadastrado com sucesso.",
        });
      }

      if (tipoSelecionado === "unidadeMedida") {
        const payload: Omit<UnidadeMedidaDTO, "id"> = {
          descricao: normalizeText(formData.descricao),
          abreviatura: normalizeText(formData.abreviatura),
          situacao: toNumber(formData.situacao, SITUACAO_ATIVO),
        };

        const result = await unidadeMedidaService.createEnvelope(payload);
        setFeedback({
          type: "success",
          message: result.message ?? "Unidade de medida cadastrada com sucesso.",
        });
      }

      await refreshData(tipoSelecionado);
    } catch (error) {
      setFeedback({
        type: "error",
        message: asErrorMessage(error, "Nao foi possivel cadastrar o registro."),
      });
      throw error;
    }
  };

  const handleUpdate = async (id: number, formData: Record<string, unknown>) => {
    setFeedback(null);

    try {
      if (tipoSelecionado === "tipoCodigo") {
        const payload: TipoCodigoDTO = {
          id,
          nome: normalizeText(formData.nome),
          descricao: normalizeText(formData.descricao),
        };

        const result = await tipoCodigoService.updateEnvelope(id, payload);
        setFeedback({
          type: "success",
          message: result.message ?? "Tipo de codigo atualizado com sucesso.",
        });
      }

      if (tipoSelecionado === "tipoInstituicao") {
        const payload: TipoInstituicaoDTO = {
          id,
          descricao: normalizeText(formData.descricao),
          situacao: toNumber(formData.situacao, SITUACAO_ATIVO),
        };

        const result = await tipoInstituicaoService.updateEnvelope(id, payload);
        setFeedback({
          type: "success",
          message: result.message ?? "Tipo de instituicao atualizado com sucesso.",
        });
      }

      if (tipoSelecionado === "tipoDespesa") {
        const payload: TipoDespesaDTO = {
          id,
          descricao: normalizeText(formData.descricao),
          solicitaUc: toNumber(formData.solicitaUc, 1),
          situacao: toNumber(formData.situacao, SITUACAO_ATIVO),
          idTipoCodigo: toNumber(formData.idTipoCodigo),
          idUnidadeMedida: toNumber(formData.idUnidadeMedida),
        };

        const result = await tipoDespesaService.updateEnvelope(id, payload);
        setFeedback({
          type: "success",
          message: result.message ?? "Tipo de despesa atualizado com sucesso.",
        });
      }

      if (tipoSelecionado === "unidadeMedida") {
        const payload: UnidadeMedidaDTO = {
          id,
          descricao: normalizeText(formData.descricao),
          abreviatura: normalizeText(formData.abreviatura),
          situacao: toNumber(formData.situacao, SITUACAO_ATIVO),
        };

        const result = await unidadeMedidaService.updateEnvelope(id, payload);
        setFeedback({
          type: "success",
          message: result.message ?? "Unidade de medida atualizada com sucesso.",
        });
      }

      await refreshData(tipoSelecionado);
    } catch (error) {
      setFeedback({
        type: "error",
        message: asErrorMessage(error, "Nao foi possivel atualizar o registro."),
      });
      throw error;
    }
  };

  const handleToggleSituacao = async (id: number) => {
    setFeedback(null);

    try {
      if (tipoSelecionado === "tipoCodigo") {
        await tipoCodigoService.delete(id);
        setFeedback({
          type: "success",
          message: "Tipo de codigo removido com sucesso.",
        });
      }

      if (tipoSelecionado === "tipoInstituicao") {
        const result = await tipoInstituicaoService.alterarSituacaoEnvelope(id);
        setFeedback({
          type: "success",
          message: result.message ?? "Situacao alterada com sucesso.",
        });
      }

      if (tipoSelecionado === "tipoDespesa") {
        const result = await tipoDespesaService.alterarSituacaoEnvelope(id);
        setFeedback({
          type: "success",
          message: result.message ?? "Situacao alterada com sucesso.",
        });
      }

      if (tipoSelecionado === "unidadeMedida") {
        const result = await unidadeMedidaService.alterarSituacaoEnvelope(id);
        setFeedback({
          type: "success",
          message: result.message ?? "Situacao alterada com sucesso.",
        });
      }

      await refreshData(tipoSelecionado);
    } catch (error) {
      setFeedback({
        type: "error",
        message: asErrorMessage(
          error,
          "Nao foi possivel alterar a situacao. Verifique se existe vinculo ativo."
        ),
      });
      throw error;
    }
  };

  if (loading) {
    return <ConfiguracoesSkeleton />;
  }

  return (
    <div className="space-y-5">
      {feedback && (
        <div
          className={`rounded-sm border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <SearchBar
        model={definition.emptyModel}
        dados={dadosOriginais}
        setDados={setDadosFiltrados}
        campos={campos}
        setCampos={setCampos}
        onCadastrar={handleCreate}
        formFields={formFields}
        formHiddenFields={["id", "situacaoLabel", "solicitaUcLabel", "unidadeMedidaLabel"]}
      />

      <section className="rounded-sm border border-[#E4EEF0] bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
        <div className="mb-3 text-sm font-medium text-[#5A6B74]">Selecione o tipo:</div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTipoSelecionado("tipoInstituicao")}
            className={`rounded-sm border px-4 py-2 text-sm font-semibold transition ${
              tipoSelecionado === "tipoInstituicao"
                ? "border-[#58AFAE] bg-[#58AFAE] text-white"
                : "border-[#D5E3E6] bg-white text-[#1F2A32] hover:bg-[#F7FAFB]"
            }`}
          >
            Tipo de Instituicao
          </button>

          <button
            type="button"
            onClick={() => setTipoSelecionado("tipoDespesa")}
            className={`rounded-sm border px-4 py-2 text-sm font-semibold transition ${
              tipoSelecionado === "tipoDespesa"
                ? "border-[#58AFAE] bg-[#58AFAE] text-white"
                : "border-[#D5E3E6] bg-white text-[#1F2A32] hover:bg-[#F7FAFB]"
            }`}
          >
            Tipo de Despesa
          </button>

          <button
            type="button"
            onClick={() => setTipoSelecionado("tipoCodigo")}
            className={`rounded-sm border px-4 py-2 text-sm font-semibold transition ${
              tipoSelecionado === "tipoCodigo"
                ? "border-[#58AFAE] bg-[#58AFAE] text-white"
                : "border-[#D5E3E6] bg-white text-[#1F2A32] hover:bg-[#F7FAFB]"
            }`}
          >
            Tipo de Codigo
          </button>

          <button
            type="button"
            onClick={() => setTipoSelecionado("unidadeMedida")}
            className={`rounded-sm border px-4 py-2 text-sm font-semibold transition ${
              tipoSelecionado === "unidadeMedida"
                ? "border-[#58AFAE] bg-[#58AFAE] text-white"
                : "border-[#D5E3E6] bg-white text-[#1F2A32] hover:bg-[#F7FAFB]"
            }`}
          >
            Unidade de Medida
          </button>
        </div>
      </section>

      <Table
        data={dadosFiltrados}
        columns={definition.columns}
        onEdit={handleUpdate}
        onDelete={handleToggleSituacao}
        formFields={formFields}
        formHiddenFields={["id", "situacaoLabel", "solicitaUcLabel", "unidadeMedidaLabel"]}
        exportConfig={{
          enabled: true,
          title: definition.label,
          fileName: definition.key,
          allData: dadosOriginais,
        }}
      />
    </div>
  );
}

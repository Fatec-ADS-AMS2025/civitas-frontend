import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";
import type { TableColumn } from "@/components/Table/export-types";
import type { FieldConfig } from "@/components/Table/searchbar";
import type TipoCodigoDTO from "@/models/tipoCodigo";
import type TipoDespesaDTO from "@/models/tipoDespesa";
import type TipoInstituicaoDTO from "@/models/tipoInstituicao";
import type UnidadeMedidaDTO from "@/models/unidadeMedida";

export type ConfigKind = "tipoCodigo" | "tipoInstituicao" | "tipoDespesa" | "unidadeMedida";

export type FeedbackType = "success" | "error";

export type FeedbackState = {
  type: FeedbackType;
  message: string;
} | null;

export type TipoInstituicaoRow = TipoInstituicaoDTO & {
  situacaoLabel: string;
};

export type TipoCodigoRow = TipoCodigoDTO;

export type UnidadeMedidaRow = UnidadeMedidaDTO & {
  situacaoLabel: string;
};

export type TipoDespesaRow = TipoDespesaDTO & {
  situacaoLabel: string;
  solicitaUcLabel: string;
  unidadeMedidaLabel: string;
};

export type ConfigRow = TipoCodigoRow | TipoInstituicaoRow | UnidadeMedidaRow | TipoDespesaRow;

export type ConfigDefinition = {
  key: ConfigKind;
  label: string;
  columns: TableColumn[];
  buildFields: (unidades: UnidadeMedidaDTO[], tipoCodigos: TipoCodigoDTO[]) => ModalFieldConfig[];
  buildSearchFields: () => FieldConfig[];
  emptyModel: Record<string, unknown>;
};

export type ConfiguracoesLookups = {
  unidadesMedida: UnidadeMedidaDTO[];
  tipoCodigos: TipoCodigoDTO[];
};

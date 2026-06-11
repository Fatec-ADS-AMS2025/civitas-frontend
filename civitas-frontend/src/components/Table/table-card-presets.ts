import type { InfoTone } from "@/components/DataDisplay";
import type { TableCardConfig, TableCardField, TableRow } from "./table-types";

type RowRecord = Record<string, unknown>;

const read = (row: TableRow, key: string) => {
  const value = (row as RowRecord)[key];
  return value === undefined || value === null || value === "" ? "" : String(value);
};

const anyOf = (row: TableRow, keys: string[], fallback = "-") =>
  keys.map((key) => read(row, key)).find(Boolean) || fallback;

const joinValues = (row: TableRow, keys: string[], separator: string, fallback: string) => {
  const values = keys.map((key) => read(row, key)).filter(Boolean);
  return values.length > 0 ? values.join(separator) : fallback;
};

const field = <T extends TableRow>(
  label: string,
  columnId: string,
  icon: string,
  tone?: InfoTone
): TableCardField<T> => ({ label, columnId, icon, tone });

const valueField = <T extends TableRow>(
  label: string,
  icon: string,
  value: (row: T) => string,
  tone?: InfoTone
): TableCardField<T> => ({ label, icon, value, tone });

export const getRouteCardConfig = <T extends TableRow>(
  pageKey: string
): TableCardConfig<T> | undefined => {
  switch (pageKey) {
    case "usuarios":
      return {
        icon: "person",
        tone: "teal",
        eyebrow: (row) => `Usuario #${read(row, "id").padStart(3, "0")}`,
        title: (row) => anyOf(row, ["nome"], "Usuario sem nome"),
        subtitle: (row) => anyOf(row, ["email"], "E-mail nao informado"),
        badgeColumnId: "situacaoLabel",
        primaryFields: [
          field("CPF", "cpf", "badge"),
          field("Matricula", "matricula", "confirmation_number"),
          field("Tipo", "tipoUsuarioLabel", "admin_panel_settings"),
        ],
        relationshipFields: [
          valueField("Localidade", "location_city", (row) =>
            joinValues(row, ["cidade", "estado"], " / ", "Localidade nao informada")
          ),
          valueField("Endereco", "home_pin", (row) =>
            joinValues(row, ["logradouro", "numero", "bairro"], ", ", "Endereco nao informado")
          ),
        ],
      };
    case "fornecedor":
      return {
        icon: "storefront",
        tone: "amber",
        title: (row) => anyOf(row, ["nomeFantasia", "nome"], "Fornecedor sem nome"),
        subtitle: (row) => anyOf(row, ["nome"], "Razao social nao informada"),
        badgeColumnId: "situacaoLabel",
        primaryFields: [
          field("CNPJ", "cnpj", "badge"),
          field("Telefone", "telefone", "call"),
          valueField("E-mail", "mail", (row) => anyOf(row, ["email"])),
        ],
        relationshipFields: [
          valueField("Localidade", "location_city", (row) =>
            joinValues(row, ["cidade", "estado"], " / ", "Localidade nao informada")
          ),
          valueField("Endereco", "home_work", (row) =>
            joinValues(row, ["logradouro", "numero", "bairro"], ", ", "Endereco nao informado")
          ),
        ],
      };
    case "orcamentos":
      return {
        icon: "account_balance_wallet",
        tone: "teal",
        title: (row) => `Orcamento ${anyOf(row, ["anoOrcamento"], "sem ano")}`,
        subtitle: (row) => anyOf(row, ["instituicaoLabel"], "Instituicao nao informada"),
        primaryFields: [
          field("Valor previsto", "valorOrcamento", "payments", "success"),
          field("Ano", "anoOrcamento", "calendar_month"),
        ],
        relationshipFields: [
          field("Instituicao", "instituicaoLabel", "account_balance"),
          field("Tipo de despesa", "tipoDespesaLabel", "category"),
        ],
      };
    case "unidades-consumidoras":
      return {
        icon: "dataset_linked",
        tone: "slate",
        title: (row) => anyOf(row, ["identificador"], "Unidade sem identificador"),
        subtitle: (row) => anyOf(row, ["instituicaoLabel"], "Instituicao nao informada"),
        badgeColumnId: "situacaoLabel",
        primaryFields: [field("Identificador", "identificador", "tag")],
        relationshipFields: [
          field("Instituicao", "instituicaoLabel", "account_balance"),
          field("Secretaria", "secretariaLabel", "corporate_fare"),
          field("Tipo de despesa", "tipoDespesaLabel", "category"),
          field("Orcamento", "orcamentoLabel", "account_balance_wallet"),
          field("Fornecedor", "fornecedorLabel", "storefront"),
        ],
        gridClassName: "grid-cols-1 xl:grid-cols-2",
      };
    default:
      return undefined;
  }
};

"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";
import {
  DespesasRelacionadasTable,
  InsightsGrid,
  InsightsModal,
  type InsightMetric,
} from "@/components/financeiro-insights";
import { SearchBar, FieldConfig } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
import {
  composeValidators,
  normalizeInstituicaoPayload,
  validateDigitsLength,
  validateMaxLength,
  validateUfCode,
} from "@/global/formPayload";
import {
  getSituacaoLabel,
  SITUACAO_ATIVO,
  SITUACAO_INATIVO,
  SITUACAO_OPTIONS,
} from "@/global/situacao";
import { despesaService } from "@/hooks/despesa";
import { instituicaoService } from "@/hooks/instituicao";
import { orcamentoService } from "@/hooks/orcamento";
import { secretariaService } from "@/hooks/secretaria";
import { tipoInstituicaoService } from "@/hooks/tipoInstituicao";
import {
  buildFinanceRelations,
  type FinanceInstituicaoResumo,
} from "@/lib/financeiro-relations";
import InstituicaoDTO from "@/models/instituicao";
import OrcamentoDTO from "@/models/orcamento";
import SecretariaDTO from "@/models/secretaria";
import TipoInstituicaoDTO from "@/models/tipoInstituicao";
import type DespesaDTO from "@/models/despesa";
import InstituicoesSkeleton from "./skeleton";

type Instituicao = InstituicaoDTO;
type Secretaria = SecretariaDTO;
type TipoInstituicao = TipoInstituicaoDTO;
type InstituicaoRow = Instituicao & {
  situacaoLabel: string;
  secretariaLabel: string;
  tipoInstituicaoLabel: string;
  quantidadeDespesas: number;
  quantidadeCodigos: number;
  totalGastosFormatado: string;
  saldoFormatado: string;
};

type InstituicaoPageData = {
  instituicoes: Instituicao[];
  secretarias: Secretaria[];
  tiposInstituicao: TipoInstituicao[];
  despesas: DespesaDTO[];
  orcamentos: OrcamentoDTO[];
};

const novaInstituicao = {
  id: 0,
  nome: "",
  cnpj: "",
  cep: "",
  logradouro: "",
  numero: "",
  bairro: "",
  cidade: "",
  estado: "",
  telefone: "",
  email: "",
  nomeRazaoSocial: "",
  situacao: SITUACAO_ATIVO,
  idTipoInstituicao: "",
  idSecretaria: "",
};

const columns = [
  { id: "nome", label: "Nome" },
  { id: "secretariaLabel", label: "Secretaria" },
  { id: "tipoInstituicaoLabel", label: "Tipo" },
  { id: "quantidadeDespesas", label: "Despesas" },
  { id: "quantidadeCodigos", label: "Codigos" },
  { id: "totalGastosFormatado", label: "Gastos" },
  { id: "saldoFormatado", label: "Saldo" },
  { id: "situacaoLabel", label: "Situacao" },
];

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const buildInstituicaoCampos = (
  secretariaOptions: FieldConfig["options"],
  tipoInstituicaoOptions: FieldConfig["options"]
): FieldConfig[] => {
  return [
    { key: "nome", placeholder: "Nome", local: "principal" },
    { key: "cnpj", placeholder: "CNPJ", local: "principal" },
    {
      key: "idTipoInstituicao",
      placeholder: "Tipo de Instituicao",
      local: "filtro",
      type: "select",
      options: tipoInstituicaoOptions,
    },
    {
      key: "idSecretaria",
      placeholder: "Secretaria",
      local: "filtro",
      type: "select",
      options: secretariaOptions,
    },
    {
      key: "situacao",
      placeholder: "Situacao",
      local: "filtro",
      type: "select",
      options: SITUACAO_OPTIONS,
    },
  ];
};

const buildLookupLabel = (label: string, situacao?: number): string => {
  if (situacao === SITUACAO_INATIVO) {
    return `${label} (Inativo)`;
  }

  return label;
};

const mapInstituicaoRows = (
  instituicoes: Instituicao[],
  secretarias: Secretaria[],
  tiposInstituicao: TipoInstituicao[],
  financeiros: FinanceInstituicaoResumo[]
): InstituicaoRow[] => {
  const secretariaMap = new Map(
    secretarias.map((secretaria) => [secretaria.idSecretaria, secretaria.nome])
  );
  const tipoMap = new Map(
    tiposInstituicao.map((tipoInstituicao) => [
      tipoInstituicao.id,
      tipoInstituicao.descricao,
    ])
  );
  const financeiroMap = new Map(
    financeiros.map((instituicao) => [instituicao.id, instituicao])
  );

  return instituicoes.map((instituicao) => {
    const secretariaId = instituicao.idSecretaria;
    const tipoInstituicaoId = instituicao.idTipoInstituicao;
    const resumoFinanceiro = financeiroMap.get(instituicao.id);

    return {
      ...instituicao,
      situacaoLabel: getSituacaoLabel(instituicao.situacao),
      secretariaLabel:
        secretariaId !== undefined
          ? secretariaMap.get(secretariaId) ?? `Secretaria #${secretariaId}`
          : "Secretaria nao informada",
      tipoInstituicaoLabel:
        tipoInstituicaoId !== undefined
          ? tipoMap.get(tipoInstituicaoId) ?? `Tipo #${tipoInstituicaoId}`
          : "Tipo nao informado",
      quantidadeDespesas: resumoFinanceiro?.quantidadeDespesas ?? 0,
      quantidadeCodigos: resumoFinanceiro?.quantidadeCodigos ?? 0,
      totalGastosFormatado: resumoFinanceiro?.totalGastosFormatado ?? formatCurrency(0),
      saldoFormatado: resumoFinanceiro?.saldoFormatado ?? formatCurrency(0),
    };
  });
};

const fetchInstituicaoPageData = async (): Promise<InstituicaoPageData> => {
  const [instituicoes, secretarias, tiposInstituicao, despesas, orcamentos] =
    await Promise.all([
      instituicaoService.getAll(),
      secretariaService.getAll(),
      tipoInstituicaoService.getAll(),
      despesaService.getAllStatusData(),
      orcamentoService.getAllData(),
    ]);

  return {
    instituicoes,
    secretarias,
    tiposInstituicao,
    despesas,
    orcamentos,
  };
};

export default function Page() {
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [filteredData, setFilteredData] = useState<InstituicaoRow[]>([]);
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [tiposInstituicao, setTiposInstituicao] = useState<TipoInstituicao[]>([]);
  const [despesas, setDespesas] = useState<DespesaDTO[]>([]);
  const [orcamentos, setOrcamentos] = useState<OrcamentoDTO[]>([]);
  const [campos, setCampos] = useState<FieldConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInstituicao, setSelectedInstituicao] =
    useState<FinanceInstituicaoResumo | null>(null);

  const secretariaOptions = useMemo(() => {
    return secretarias.map((secretaria) => ({
      value: secretaria.idSecretaria,
      label: buildLookupLabel(secretaria.nome, secretaria.situacao),
    }));
  }, [secretarias]);

  const tipoInstituicaoOptions = useMemo(() => {
    return tiposInstituicao.map((tipoInstituicao) => ({
      value: tipoInstituicao.id,
      label: buildLookupLabel(tipoInstituicao.descricao, tipoInstituicao.situacao),
    }));
  }, [tiposInstituicao]);

  const instituicaoFormFields = useMemo<ModalFieldConfig[]>(() => {
    return [
      { key: "id", hidden: true },
      {
        key: "nome",
        label: "Nome",
        placeholder: "Nome da instituicao",
        required: true,
      },
      {
        key: "nomeRazaoSocial",
        label: "Razao Social",
        placeholder: "Razao social da instituicao",
        required: true,
      },
      {
        key: "cnpj",
        label: "CNPJ",
        placeholder: "00.000.000/0000-00",
        mask: "cnpj",
        required: true,
        validate: validateDigitsLength("CNPJ", 14),
      },
      {
        key: "cep",
        label: "CEP",
        placeholder: "00000-000",
        mask: "cep",
        required: true,
        validate: validateDigitsLength("CEP", 8),
      },
      {
        key: "logradouro",
        label: "Logradouro",
        placeholder: "Rua / Avenida",
        required: true,
      },
      {
        key: "numero",
        label: "Numero",
        placeholder: "Numero",
        required: true,
        validate: validateMaxLength("Numero", 4),
      },
      {
        key: "bairro",
        label: "Bairro",
        placeholder: "Bairro",
        required: true,
      },
      {
        key: "cidade",
        label: "Cidade",
        placeholder: "Cidade",
        required: true,
      },
      {
        key: "estado",
        label: "Estado",
        placeholder: "UF",
        required: true,
        validate: composeValidators(
          validateUfCode(),
          validateMaxLength("Estado", 2)
        ),
      },
      {
        key: "telefone",
        label: "Telefone",
        placeholder: "(00) 00000-0000",
        type: "tel",
        mask: "phone",
        required: true,
      },
      {
        key: "email",
        label: "E-mail",
        placeholder: "email@instituicao.com",
        type: "email",
        required: true,
      },
      {
        key: "idTipoInstituicao",
        label: "Tipo de Instituicao",
        placeholder: "Selecione o tipo de instituicao",
        type: "select",
        required: true,
        options: tipoInstituicaoOptions,
      },
      {
        key: "idSecretaria",
        label: "Secretaria",
        placeholder: "Selecione a secretaria",
        type: "select",
        required: true,
        options: secretariaOptions,
      },
      {
        key: "situacao",
        label: "Situacao",
        type: "select",
        required: true,
        options: SITUACAO_OPTIONS,
      },
    ];
  }, [secretariaOptions, tipoInstituicaoOptions]);

  const relations = useMemo(() => {
    return buildFinanceRelations({
      despesas,
      instituicoes,
      secretarias,
      orcamentos,
    });
  }, [despesas, instituicoes, orcamentos, secretarias]);

  const instituicaoRows = useMemo(() => {
    return mapInstituicaoRows(
      instituicoes,
      secretarias,
      tiposInstituicao,
      relations.instituicoes
    );
  }, [instituicoes, relations.instituicoes, secretarias, tiposInstituicao]);

  const panoramaMetrics = useMemo<InsightMetric[]>(() => {
    const instituicoesComGastos = relations.instituicoes.filter(
      (instituicao) => instituicao.quantidadeDespesas > 0
    );
    const totalGastos = relations.instituicoes.reduce(
      (accumulator, item) => accumulator + item.totalGastos,
      0
    );
    const totalOrcamentos = relations.instituicoes.reduce(
      (accumulator, item) => accumulator + item.totalOrcamentos,
      0
    );

    return [
      {
        label: "Instituicoes",
        value: String(relations.instituicoes.length),
        hint: `${instituicoesComGastos.length} com despesas vinculadas`,
        tone: "teal",
      },
      {
        label: "Gasto acumulado",
        value: formatCurrency(totalGastos),
        hint: "Soma consolidada das despesas por instituicao",
        tone: "amber",
      },
      {
        label: "Orcamento",
        value: formatCurrency(totalOrcamentos),
        hint: "Volume total de orcamentos vinculados",
        tone: "slate",
      },
      {
        label: "Saldo",
        value: formatCurrency(totalOrcamentos - totalGastos),
        hint: "Balanca entre orcamento e gasto consolidado",
        tone: "coral",
      },
    ];
  }, [relations.instituicoes]);

  const topInstituicoes = useMemo(() => {
    return relations.instituicoes.slice(0, 6);
  }, [relations.instituicoes]);

  const refreshInstituicoes = async () => {
    const pageData = await fetchInstituicaoPageData();

    setInstituicoes(pageData.instituicoes);
    setSecretarias(pageData.secretarias);
    setTiposInstituicao(pageData.tiposInstituicao);
    setDespesas(pageData.despesas);
    setOrcamentos(pageData.orcamentos);
  };

  useEffect(() => {
    setCampos(buildInstituicaoCampos(secretariaOptions, tipoInstituicaoOptions));
  }, [secretariaOptions, tipoInstituicaoOptions]);

  useEffect(() => {
    setFilteredData(instituicaoRows);
  }, [instituicaoRows]);

  useEffect(() => {
    const loadInstituicoes = async () => {
      try {
        setLoading(true);
        await refreshInstituicoes();
        setError(null);
      } catch (err) {
        console.error("Erro ao carregar instituicoes:", err);
        setInstituicoes([]);
        setFilteredData([]);
        setSecretarias([]);
        setTiposInstituicao([]);
        setDespesas([]);
        setOrcamentos([]);
        setCampos([]);
        setError(
          "Nao foi possivel carregar as instituicoes. Verifique o backend e tente novamente."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadInstituicoes();
  }, []);

  const handleCreate = async (data: Omit<Instituicao, "id">) => {
    await instituicaoService.create(normalizeInstituicaoPayload(data));
    await refreshInstituicoes();
  };

  const handleUpdate = async (id: number, data: Partial<Instituicao>) => {
    await instituicaoService.update(id, normalizeInstituicaoPayload(data));
    await refreshInstituicoes();
  };

  const handleDelete = async (id: number) => {
    await instituicaoService.alterarSituacao(id);
    await refreshInstituicoes();
  };

  if (loading) {
    return <InstituicoesSkeleton />;
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-sm border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          {error}
        </div>
      )}

      <section className="civitas-surface civitas-enter mb-5 space-y-5 p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
              Relacao institucional
            </p>
            <h2 className="mt-2 text-[28px] font-semibold text-[var(--secundary-1)]">
              Instituicao x secretaria com gastos e saldo em contexto.
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--foreground-muted)]">
              O backend fornece a amarracao entre instituicao e secretaria, e aqui a
              leitura financeira combina despesas, orcamentos e codigos para abrir
              detalhes sem sair da listagem.
            </p>
          </div>
        </div>

        <InsightsGrid metrics={panoramaMetrics} />

        <div className="grid gap-4 xl:grid-cols-2">
          {topInstituicoes.map((instituicao) => (
            <article
              key={instituicao.id}
              className="rounded-sm border border-[var(--border-soft)] bg-[linear-gradient(180deg,var(--surface-elevated),var(--surface-subtle))] p-5 shadow-[0_18px_30px_rgba(13,28,33,0.06)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="inline-flex rounded-sm border border-[var(--border-default)] bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
                    {instituicao.secretariaNome}
                  </span>
                  <h3 className="mt-3 truncate text-xl font-semibold text-[var(--foreground)]">
                    {instituicao.nome}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                    {instituicao.quantidadeDespesas} despesas em {instituicao.quantidadeCodigos}{" "}
                    codigos consolidados
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedInstituicao(instituicao)}
                  className="civitas-action civitas-action--ghost rounded-sm px-4 py-2 text-sm"
                >
                  Ver gastos
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-sm border border-[var(--border-soft)] bg-white p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
                    Gasto
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[var(--secundary-1)]">
                    {instituicao.totalGastosFormatado}
                  </p>
                </div>
                <div className="rounded-sm border border-[var(--border-soft)] bg-white p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
                    Orcamento
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                    {instituicao.totalOrcamentosFormatado}
                  </p>
                </div>
                <div className="rounded-sm border border-[var(--border-soft)] bg-white p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
                    Saldo
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                    {instituicao.saldoFormatado}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <SearchBar
        model={novaInstituicao}
        dados={instituicaoRows}
        setDados={setFilteredData}
        campos={campos}
        setCampos={setCampos}
        onCadastrar={handleCreate}
        formFields={instituicaoFormFields}
        formHiddenFields={["id"]}
      />

      <Table
        data={filteredData}
        columns={columns}
        onEdit={handleUpdate}
        onDelete={handleDelete}
        formFields={instituicaoFormFields}
        formHiddenFields={["id"]}
        exportConfig={{
          enabled: true,
          title: "Instituicoes",
          fileName: "instituicoes",
          allData: instituicaoRows,
        }}
        paginationEnabled={false}
      />

      <InsightsModal
        open={selectedInstituicao !== null}
        onClose={() => setSelectedInstituicao(null)}
        title={selectedInstituicao?.nome ?? ""}
        subtitle={`Instituicao vinculada a ${selectedInstituicao?.secretariaNome ?? "sem secretaria"} com leitura por codigo e lista completa de despesas.`}
        metrics={
          selectedInstituicao
            ? [
                {
                  label: "Gasto total",
                  value: selectedInstituicao.totalGastosFormatado,
                  hint: "Soma consolidada das despesas da instituicao",
                  tone: "teal",
                },
                {
                  label: "Orcamento",
                  value: selectedInstituicao.totalOrcamentosFormatado,
                  hint: "Total de orcamentos vinculados",
                  tone: "slate",
                },
                {
                  label: "Saldo",
                  value: selectedInstituicao.saldoFormatado,
                  hint: "Balanca entre orcamento e gasto",
                  tone: "amber",
                },
                {
                  label: "Codigos",
                  value: String(selectedInstituicao.quantidadeCodigos),
                  hint: `${selectedInstituicao.quantidadeDespesas} despesas relacionadas`,
                  tone: "coral",
                },
              ]
            : []
        }
      >
        <section className="space-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
              Agrupamento por codigo
            </p>
            <h4 className="mt-1 text-lg font-semibold text-[var(--foreground)]">
              Todos os gastos do mesmo codigo dentro da instituicao
            </h4>
          </div>

          {selectedInstituicao && selectedInstituicao.codigos.length > 0 ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {selectedInstituicao.codigos.map((codigo) => (
                <article
                  key={`${selectedInstituicao.id}-${codigo.codigoNormalizado}`}
                  className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
                        Codigo
                      </p>
                      <h5 className="mt-2 text-lg font-semibold text-[var(--secundary-1)]">
                        {codigo.codigo}
                      </h5>
                    </div>
                    <span className="rounded-sm border border-[var(--border-default)] bg-white px-3 py-1 text-xs font-semibold text-[var(--foreground-muted)]">
                      {codigo.quantidadeDespesas} despesas
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-sm bg-white p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
                        Total
                      </p>
                      <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
                        {codigo.totalGastosFormatado}
                      </p>
                    </div>
                    <div className="rounded-sm bg-white p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
                        Ultima referencia
                      </p>
                      <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
                        {codigo.ultimaReferenciaFormatada}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-sm border border-dashed border-[var(--border-default)] bg-[var(--surface-subtle)] px-4 py-8 text-center text-sm text-[var(--foreground-soft)]">
              Nenhum codigo vinculado a esta instituicao ate o momento.
            </div>
          )}
        </section>

        <section className="space-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
              Despesas relacionadas
            </p>
            <h4 className="mt-1 text-lg font-semibold text-[var(--foreground)]">
              Lista completa das despesas da instituicao
            </h4>
          </div>

          <DespesasRelacionadasTable
            despesas={selectedInstituicao?.despesas ?? []}
            emptyMessage="Nenhuma despesa encontrada para esta instituicao."
            showInstituicao={false}
          />
        </section>
      </InsightsModal>
    </>
  );
}



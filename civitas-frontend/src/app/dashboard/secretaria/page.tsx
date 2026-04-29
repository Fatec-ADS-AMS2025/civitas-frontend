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
  normalizeSecretariaPayload,
  validateDigitsLength,
  validateMaxLength,
  validateUfCode,
} from "@/global/formPayload";
import {
  getSituacaoLabel,
  SITUACAO_ATIVO,
  SITUACAO_OPTIONS,
} from "@/global/situacao";
import { despesaService } from "@/hooks/despesa";
import { instituicaoService } from "@/hooks/instituicao";
import { orcamentoService } from "@/hooks/orcamento";
import { secretariaService } from "@/hooks/secretaria";
import {
  buildFinanceRelations,
  type FinanceSecretariaResumo,
} from "@/lib/financeiro-relations";
import type DespesaDTO from "@/models/despesa";
import type InstituicaoDTO from "@/models/instituicao";
import type OrcamentoDTO from "@/models/orcamento";
import SecretariaDTO from "@/models/secretaria";
import SecretariaSkeleton from "./skeleton";

type Secretaria = SecretariaDTO;
type SecretariaRow = Secretaria & {
  situacaoLabel: string;
  quantidadeInstituicoes: number;
  quantidadeDespesas: number;
  quantidadeCodigos: number;
  totalGastosFormatado: string;
  saldoFormatado: string;
};

type SecretariaPageData = {
  secretarias: Secretaria[];
  instituicoes: InstituicaoDTO[];
  despesas: DespesaDTO[];
  orcamentos: OrcamentoDTO[];
};

const novaSecretaria = {
  idSecretaria: 0,
  situacao: SITUACAO_ATIVO,
  descricao: "",
  cnpj: "",
  nome: "",
  logradouro: "",
  numero: "",
  bairro: "",
  cep: "",
  nomeRazaoSocial: "",
  telefone: "",
  email: "",
  cidade: "",
  estado: "",
};

const columns = [
  { id: "idSecretaria", label: "ID Secretaria" },
  { id: "nome", label: "Nome" },
  { id: "quantidadeInstituicoes", label: "Instituicoes" },
  { id: "quantidadeDespesas", label: "Despesas" },
  { id: "quantidadeCodigos", label: "Codigos" },
  { id: "totalGastosFormatado", label: "Gastos" },
  { id: "saldoFormatado", label: "Saldo" },
  { id: "situacaoLabel", label: "Situacao" },
];

const camposConst: FieldConfig[] = [
  { key: "descricao", placeholder: "Descricao", local: "principal" },
  { key: "cnpj", placeholder: "CNPJ", local: "principal" },
  { key: "telefone", placeholder: "Telefone", local: "filtro" },
  {
    key: "situacao",
    placeholder: "Situacao",
    local: "filtro",
    type: "select",
    options: SITUACAO_OPTIONS,
  },
  { key: "cidade", placeholder: "Cidade", local: "filtro" },
];

const secretariaFormFields: ModalFieldConfig[] = [
  { key: "idSecretaria", hidden: true },
  {
    key: "nome",
    label: "Nome",
    placeholder: "Nome da secretaria",
    required: true,
  },
  {
    key: "nomeRazaoSocial",
    label: "Razao Social",
    placeholder: "Razao social da secretaria",
    required: true,
  },
  {
    key: "cnpj",
    label: "CNPJ",
    placeholder: "00.000.000/0000-00",
    required: true,
    validate: validateDigitsLength("CNPJ", 14),
  },
  {
    key: "descricao",
    label: "Descricao",
    placeholder: "Descricao da secretaria",
    required: true,
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
    validate: validateMaxLength("Numero", 10),
  },
  {
    key: "bairro",
    label: "Bairro",
    placeholder: "Bairro",
    required: true,
  },
  {
    key: "cep",
    label: "CEP",
    placeholder: "00000-000",
    required: true,
    validate: validateDigitsLength("CEP", 8),
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
    validate: composeValidators(validateUfCode(), validateMaxLength("Estado", 2)),
  },
  {
    key: "telefone",
    label: "Telefone",
    placeholder: "(00) 00000-0000",
    type: "tel",
    required: true,
  },
  {
    key: "email",
    label: "E-mail",
    placeholder: "email@secretaria.gov.br",
    type: "email",
    required: true,
  },
  {
    key: "situacao",
    label: "Situacao",
    type: "select",
    required: true,
    options: SITUACAO_OPTIONS,
  },
];

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const mapSecretariaRows = (
  items: Secretaria[],
  financeiros: FinanceSecretariaResumo[]
): SecretariaRow[] => {
  const financeiroMap = new Map(
    financeiros.map((secretaria) => [secretaria.id, secretaria])
  );

  return items.map((item) => {
    const resumoFinanceiro = financeiroMap.get(item.idSecretaria);

    return {
      ...item,
      situacaoLabel: getSituacaoLabel(item.situacao),
      quantidadeInstituicoes: resumoFinanceiro?.quantidadeInstituicoes ?? 0,
      quantidadeDespesas: resumoFinanceiro?.quantidadeDespesas ?? 0,
      quantidadeCodigos: resumoFinanceiro?.quantidadeCodigos ?? 0,
      totalGastosFormatado: resumoFinanceiro?.totalGastosFormatado ?? formatCurrency(0),
      saldoFormatado: resumoFinanceiro?.saldoFormatado ?? formatCurrency(0),
    };
  });
};

const fetchSecretariaPageData = async (): Promise<SecretariaPageData> => {
  const [secretarias, instituicoes, despesas, orcamentos] = await Promise.all([
    secretariaService.getAll(),
    instituicaoService.getAllData(),
    despesaService.getAllStatusData(),
    orcamentoService.getAllData(),
  ]);

  return {
    secretarias,
    instituicoes,
    despesas,
    orcamentos,
  };
};

export default function Page() {
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [instituicoes, setInstituicoes] = useState<InstituicaoDTO[]>([]);
  const [despesas, setDespesas] = useState<DespesaDTO[]>([]);
  const [orcamentos, setOrcamentos] = useState<OrcamentoDTO[]>([]);
  const [filteredData, setFilteredData] = useState<SecretariaRow[]>([]);
  const [campos, setCampos] = useState<FieldConfig[]>(camposConst);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSecretaria, setSelectedSecretaria] =
    useState<FinanceSecretariaResumo | null>(null);

  const relations = useMemo(() => {
    return buildFinanceRelations({
      despesas,
      instituicoes,
      secretarias,
      orcamentos,
    });
  }, [despesas, instituicoes, orcamentos, secretarias]);

  const secretariaRows = useMemo(() => {
    return mapSecretariaRows(secretarias, relations.secretarias);
  }, [relations.secretarias, secretarias]);

  const panoramaMetrics = useMemo<InsightMetric[]>(() => {
    const totalGastos = relations.secretarias.reduce(
      (accumulator, item) => accumulator + item.totalGastos,
      0
    );
    const totalOrcamentos = relations.secretarias.reduce(
      (accumulator, item) => accumulator + item.totalOrcamentos,
      0
    );
    const instituicoesComGastos = relations.secretarias.reduce(
      (accumulator, item) => accumulator + item.quantidadeInstituicoesComGastos,
      0
    );

    return [
      {
        label: "Secretarias",
        value: String(relations.secretarias.length),
        hint: `${instituicoesComGastos} instituicoes com gasto consolidado`,
        tone: "teal",
      },
      {
        label: "Gasto total",
        value: formatCurrency(totalGastos),
        hint: "Soma das despesas das instituicoes vinculadas",
        tone: "amber",
      },
      {
        label: "Orcamento",
        value: formatCurrency(totalOrcamentos),
        hint: "Orcamento consolidado por secretaria",
        tone: "slate",
      },
      {
        label: "Saldo",
        value: formatCurrency(totalOrcamentos - totalGastos),
        hint: "Balanca das redes institucionais",
        tone: "coral",
      },
    ];
  }, [relations.secretarias]);

  const topSecretarias = useMemo(() => {
    return relations.secretarias.slice(0, 6);
  }, [relations.secretarias]);

  const refreshSecretarias = async () => {
    const pageData = await fetchSecretariaPageData();
    setSecretarias(pageData.secretarias);
    setInstituicoes(pageData.instituicoes);
    setDespesas(pageData.despesas);
    setOrcamentos(pageData.orcamentos);
  };

  useEffect(() => {
    setFilteredData(secretariaRows);
  }, [secretariaRows]);

  useEffect(() => {
    const loadSecretarias = async () => {
      try {
        setLoading(true);
        await refreshSecretarias();
        setError(null);
      } catch (err) {
        console.error("Erro ao carregar secretarias:", err);
        setSecretarias([]);
        setInstituicoes([]);
        setDespesas([]);
        setOrcamentos([]);
        setFilteredData([]);
        setError(
          "Nao foi possivel carregar as secretarias. Verifique o backend e tente novamente."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadSecretarias();
  }, []);

  const handleCreate = async (data: Omit<Secretaria, "idSecretaria">) => {
    await secretariaService.create(normalizeSecretariaPayload(data));
    await refreshSecretarias();
  };

  const handleUpdate = async (id: number, data: Partial<Secretaria>) => {
    await secretariaService.update(id, normalizeSecretariaPayload(data));
    await refreshSecretarias();
  };

  const handleDelete = async (id: number) => {
    await secretariaService.alterarSituacao(id);
    await refreshSecretarias();
  };

  if (loading) {
    return <SecretariaSkeleton />;
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-sm border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          {error}
        </div>
      )}

      <section className="civitas-surface civitas-enter mb-5 space-y-5 p-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
            Rede por secretaria
          </p>
          <h2 className="mt-2 text-[28px] font-semibold text-[var(--secundary-1)]">
            Veja cada secretaria com todas as instituicoes e a balanca de gastos.
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--foreground-muted)]">
            A leitura detalhada combina as instituicoes vinculadas, as despesas por
            codigo e o saldo entre gasto e orcamento para abrir tudo em modal sem
            alterar o fluxo principal de cadastro.
          </p>
        </div>

        <InsightsGrid metrics={panoramaMetrics} />

        <div className="grid gap-4 xl:grid-cols-2">
          {topSecretarias.map((secretaria) => (
            <article
              key={secretaria.id}
              className="rounded-sm border border-[var(--border-soft)] bg-[linear-gradient(180deg,var(--surface-elevated),var(--surface-subtle))] p-5 shadow-[0_18px_30px_rgba(13,28,33,0.06)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="inline-flex rounded-sm border border-[var(--border-default)] bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
                    {secretaria.quantidadeInstituicoes} instituicoes
                  </span>
                  <h3 className="mt-3 truncate text-xl font-semibold text-[var(--foreground)]">
                    {secretaria.nome}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                    {secretaria.quantidadeDespesas} despesas em {secretaria.quantidadeCodigos}{" "}
                    codigos consolidados
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedSecretaria(secretaria)}
                  className="civitas-action civitas-action--ghost rounded-sm px-4 py-2 text-sm"
                >
                  Ver instituicoes
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-sm border border-[var(--border-soft)] bg-white p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
                    Gasto
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[var(--secundary-1)]">
                    {secretaria.totalGastosFormatado}
                  </p>
                </div>
                <div className="rounded-sm border border-[var(--border-soft)] bg-white p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
                    Orcamento
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                    {secretaria.totalOrcamentosFormatado}
                  </p>
                </div>
                <div className="rounded-sm border border-[var(--border-soft)] bg-white p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
                    Saldo
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                    {secretaria.saldoFormatado}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <SearchBar
        model={novaSecretaria}
        dados={secretariaRows}
        setDados={setFilteredData}
        campos={campos}
        formFields={secretariaFormFields}
        setCampos={setCampos}
        onCadastrar={handleCreate}
      />

      <Table
        data={filteredData}
        columns={columns}
        onEdit={handleUpdate}
        onDelete={handleDelete}
        formFields={secretariaFormFields}
        exportConfig={{
          enabled: true,
          title: "Secretarias",
          fileName: "secretarias",
          allData: secretariaRows,
        }}
      />

      <InsightsModal
        open={selectedSecretaria !== null}
        onClose={() => setSelectedSecretaria(null)}
        title={selectedSecretaria?.nome ?? ""}
        subtitle="Modal com todas as instituicoes da secretaria, cards de balanca e a lista consolidada das despesas vinculadas."
        metrics={
          selectedSecretaria
            ? [
                {
                  label: "Instituicoes",
                  value: String(selectedSecretaria.quantidadeInstituicoes),
                  hint: `${selectedSecretaria.quantidadeInstituicoesComGastos} com gastos`,
                  tone: "teal",
                },
                {
                  label: "Gasto total",
                  value: selectedSecretaria.totalGastosFormatado,
                  hint: "Despesas de toda a rede institucional",
                  tone: "amber",
                },
                {
                  label: "Orcamento",
                  value: selectedSecretaria.totalOrcamentosFormatado,
                  hint: "Orcamento consolidado das instituicoes",
                  tone: "slate",
                },
                {
                  label: "Saldo",
                  value: selectedSecretaria.saldoFormatado,
                  hint: `${selectedSecretaria.quantidadeCodigos} codigos vinculados`,
                  tone: "coral",
                },
              ]
            : []
        }
      >
        <section className="space-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
              Cards de balanca
            </p>
            <h4 className="mt-1 text-lg font-semibold text-[var(--foreground)]">
              Todas as instituicoes da secretaria com gastos e saldo
            </h4>
          </div>

          {selectedSecretaria && selectedSecretaria.instituicoes.length > 0 ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {selectedSecretaria.instituicoes.map((instituicao) => (
                <article
                  key={`${selectedSecretaria.id}-${instituicao.id}`}
                  className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h5 className="truncate text-lg font-semibold text-[var(--foreground)]">
                        {instituicao.nome}
                      </h5>
                      <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                        {instituicao.quantidadeDespesas} despesas em{" "}
                        {instituicao.quantidadeCodigos} codigos
                      </p>
                    </div>
                    <span className="rounded-sm border border-[var(--border-default)] bg-white px-3 py-1 text-xs font-semibold text-[var(--foreground-muted)]">
                      {instituicao.secretariaNome}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-sm bg-white p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
                        Gasto
                      </p>
                      <p className="mt-2 text-base font-semibold text-[var(--secundary-1)]">
                        {instituicao.totalGastosFormatado}
                      </p>
                    </div>
                    <div className="rounded-sm bg-white p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
                        Orcamento
                      </p>
                      <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
                        {instituicao.totalOrcamentosFormatado}
                      </p>
                    </div>
                    <div className="rounded-sm bg-white p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
                        Saldo
                      </p>
                      <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
                        {instituicao.saldoFormatado}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-sm border border-dashed border-[var(--border-default)] bg-[var(--surface-subtle)] px-4 py-8 text-center text-sm text-[var(--foreground-soft)]">
              Nenhuma instituicao vinculada a esta secretaria.
            </div>
          )}
        </section>

        <section className="space-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
              Despesas da secretaria
            </p>
            <h4 className="mt-1 text-lg font-semibold text-[var(--foreground)]">
              Todas as despesas das instituicoes listadas
            </h4>
          </div>

          <DespesasRelacionadasTable
            despesas={selectedSecretaria?.despesas ?? []}
            emptyMessage="Nenhuma despesa encontrada para esta secretaria."
          />
        </section>
      </InsightsModal>
    </>
  );
}



import type {
  FinanceCodigoResumo,
  FinanceInstituicaoResumo,
} from "@/lib/financeiro-relations";

type DespesasExplorerGroupsProps = {
  codigoGroups: FinanceCodigoResumo[];
  instituicaoGroups: FinanceInstituicaoResumo[];
  hasExplorerSearch: boolean;
  onSelectCodigoGroup: (group: FinanceCodigoResumo) => void;
  onSelectInstituicaoGroup: (group: FinanceInstituicaoResumo) => void;
};

export default function DespesasExplorerGroups({
  codigoGroups,
  instituicaoGroups,
  hasExplorerSearch,
  onSelectCodigoGroup,
  onSelectInstituicaoGroup,
}: DespesasExplorerGroupsProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <div className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
          Agrupamento por codigo
        </p>
        <p className="mt-1 text-sm text-[var(--foreground-muted)]">
          Pesquise um codigo especifico e abra todas as despesas relacionadas.
        </p>

        <div className="mt-4 space-y-3">
          {codigoGroups.length > 0 ? (
            codigoGroups.map((codigo) => (
              <article
                key={codigo.codigoNormalizado}
                className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="truncate text-base font-semibold text-[var(--secundary-1)]">
                      {codigo.codigo}
                    </h4>
                    <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                      {codigo.quantidadeDespesas} despesas em{" "}
                      {codigo.quantidadeInstituicoes} instituicoes
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectCodigoGroup(codigo)}
                    className="civitas-action civitas-action--ghost rounded-sm px-4 py-2 text-sm"
                  >
                    Ver gastos
                  </button>
                </div>
                <p className="mt-3 text-lg font-semibold text-[var(--foreground)]">
                  {codigo.totalGastosFormatado}
                </p>
              </article>
            ))
          ) : (
            <EmptyExplorerMessage
              message={
                hasExplorerSearch
                  ? "Nenhum codigo encontrado para a busca informada."
                  : "Nenhum codigo encontrado nas despesas filtradas."
              }
            />
          )}
        </div>
      </div>

      <div className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-default)] p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
          Agrupamento por instituicao
        </p>
        <p className="mt-1 text-sm text-[var(--foreground-muted)]">
          Localize uma instituicao e veja seus codigos e gastos consolidados.
        </p>

        <div className="mt-4 space-y-3">
          {instituicaoGroups.length > 0 ? (
            instituicaoGroups.map((instituicao) => (
              <article
                key={instituicao.id}
                className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="inline-flex rounded-sm border border-[var(--border-default)] bg-[var(--surface-subtle)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
                      {instituicao.secretariaNome}
                    </span>
                    <h4 className="mt-3 truncate text-lg font-semibold text-[var(--foreground)]">
                      {instituicao.nome}
                    </h4>
                    <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                      {instituicao.quantidadeDespesas} despesas em{" "}
                      {instituicao.quantidadeCodigos} codigos
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectInstituicaoGroup(instituicao)}
                    className="civitas-action civitas-action--ghost rounded-sm px-4 py-2 text-sm"
                  >
                    Ver instituicao
                  </button>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <ExplorerMiniStat label="Gasto" value={instituicao.totalGastosFormatado} />
                  <ExplorerMiniStat
                    label="Orcamento"
                    value={instituicao.totalOrcamentosFormatado}
                  />
                  <ExplorerMiniStat label="Saldo" value={instituicao.saldoFormatado} />
                </div>
              </article>
            ))
          ) : (
            <EmptyExplorerMessage
              message={
                hasExplorerSearch
                  ? "Nenhuma instituicao encontrada para a busca informada."
                  : "Nenhuma instituicao com despesas encontrada no recorte atual."
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ExplorerMiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold text-[var(--secundary-1)]">{value}</p>
    </div>
  );
}

function EmptyExplorerMessage({ message }: { message: string }) {
  return (
    <div className="rounded-sm border border-dashed border-[var(--border-default)] px-4 py-8 text-center text-sm text-[var(--foreground-soft)]">
      {message}
    </div>
  );
}

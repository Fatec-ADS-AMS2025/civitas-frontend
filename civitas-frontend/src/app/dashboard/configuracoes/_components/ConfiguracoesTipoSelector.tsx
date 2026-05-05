"use client";

import { CONFIG_SELECTOR_ITEMS } from "./configuracoes.constants";
import type { ConfigKind } from "./configuracoes.types";

type ConfiguracoesTipoSelectorProps = {
  selected: ConfigKind;
  onSelect: (kind: ConfigKind) => void;
};

export default function ConfiguracoesTipoSelector({
  selected,
  onSelect,
}: ConfiguracoesTipoSelectorProps) {
  return (
    <section className="rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-4 shadow-[var(--shadow-sm)]">
      <div className="mb-3 text-sm font-medium text-[var(--foreground-muted)]">
        Selecione o tipo:
      </div>
      <div className="flex flex-wrap gap-2">
        {CONFIG_SELECTOR_ITEMS.map((item) => {
          const isActive = selected === item.key;
          const classes = isActive
            ? "border-[var(--border-accent-teal)] bg-[var(--primary-1)] text-white"
            : "border-[var(--border-default)] bg-[var(--surface-elevated)] text-[var(--foreground)] hover:bg-[var(--surface-subtle)]";

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
              className={`rounded-sm border px-4 py-2 text-sm font-semibold transition ${classes}`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

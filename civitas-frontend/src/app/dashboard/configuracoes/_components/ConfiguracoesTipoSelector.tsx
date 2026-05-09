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
    <section className="civitas-surface p-4">
      <div className="mb-3 text-sm font-medium text-[var(--foreground-muted)]">
        Selecione o tipo:
      </div>
      <div className="flex flex-wrap gap-2">
        {CONFIG_SELECTOR_ITEMS.map((item) => {
          const isActive = selected === item.key;
          const classes = isActive
            ? "civitas-action--primary"
            : "civitas-action--ghost";

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
              className={`civitas-action px-4 py-2 text-sm ${classes}`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

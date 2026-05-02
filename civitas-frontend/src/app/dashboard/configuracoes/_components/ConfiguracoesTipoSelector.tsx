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
    <section className="rounded-sm border border-[#E4EEF0] bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
      <div className="mb-3 text-sm font-medium text-[#5A6B74]">
        Selecione o tipo:
      </div>
      <div className="flex flex-wrap gap-2">
        {CONFIG_SELECTOR_ITEMS.map((item) => {
          const isActive = selected === item.key;
          const classes = isActive
            ? "border-[#58AFAE] bg-[#58AFAE] text-white"
            : "border-[#D5E3E6] bg-white text-[#1F2A32] hover:bg-[#F7FAFB]";

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

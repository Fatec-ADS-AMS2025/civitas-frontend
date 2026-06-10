"use client";

import { useDeferredValue, useId, useMemo, useState } from "react";
import type { DespesaUcOption } from "./DespesaForm";

type UcComboboxProps = {
  ucs: DespesaUcOption[];
  selectedUc: DespesaUcOption | null;
  disabled: boolean;
  error?: string;
  onSelect: (uc: DespesaUcOption) => void;
  onClearSelection: () => void;
};

const normalizeSearchText = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export default function UcCombobox({
  ucs,
  selectedUc,
  disabled,
  error,
  onSelect,
  onClearSelection,
}: UcComboboxProps) {
  const comboboxId = useId();
  const listboxId = `${comboboxId}-listbox`;
  const [query, setQuery] = useState(() => selectedUc?.identificador ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const inputValue = !isOpen && selectedUc ? selectedUc.identificador : query;
  const deferredQuery = useDeferredValue(inputValue);
  const isSearching = inputValue !== deferredQuery;

  const filteredUcs = useMemo(() => {
    const normalizedQuery = normalizeSearchText(deferredQuery);

    if (!normalizedQuery) return ucs.slice(0, 20);

    return ucs
      .filter((uc) => {
        const target = normalizeSearchText(
          [
            uc.id,
            uc.identificador,
            uc.instituicaoNome,
            uc.secretariaNome,
            uc.tipoDespesaNome,
            uc.fornecedorNome,
          ].join(" ")
        );

        return target.includes(normalizedQuery);
      })
      .slice(0, 20);
  }, [deferredQuery, ucs]);

  const handleQueryChange = (nextQuery: string) => {
    setQuery(nextQuery);
    setIsOpen(true);

    if (
      selectedUc &&
      normalizeSearchText(nextQuery) !== normalizeSearchText(selectedUc.identificador)
    ) {
      onClearSelection();
    }
  };

  const handleSelect = (uc: DespesaUcOption) => {
    onSelect(uc);
    setQuery(uc.identificador);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <label
        htmlFor={comboboxId}
        className="block text-sm font-semibold tracking-[0.01em] text-[var(--foreground-muted)]"
      >
        Unidade consumidora
        <span className="ml-1 text-red-500">*</span>
      </label>
      <div className="relative">
        <div className="flex items-center gap-2 rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] px-3 focus-within:border-[var(--primary-1)] focus-within:ring-4 focus-within:ring-[var(--focus-ring)]">
          <span className="material-symbols-outlined !text-[18px] text-[var(--foreground-muted)]">
            search
          </span>
          <input
            id={comboboxId}
            type="text"
            role="combobox"
            aria-controls={listboxId}
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-invalid={Boolean(error)}
            disabled={disabled}
            value={inputValue}
            placeholder="Digite ID, UC, instituicao, secretaria..."
            onFocus={() => {
              if (selectedUc) setQuery(selectedUc.identificador);
              setIsOpen(true);
            }}
            onChange={(event) => handleQueryChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setIsOpen(false);
              if (event.key === "Enter" && filteredUcs[0]) {
                event.preventDefault();
                handleSelect(filteredUcs[0]);
              }
            }}
            className="min-h-11 w-full bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--foreground-muted)] disabled:cursor-not-allowed"
          />
          {isSearching ? (
            <span className="material-symbols-outlined !text-[18px] animate-spin text-[var(--foreground-muted)]">
              progress_activity
            </span>
          ) : (
            <button
              type="button"
              disabled={disabled}
              onClick={() => setIsOpen((current) => !current)}
              className="flex h-8 w-8 items-center justify-center rounded-sm text-[var(--foreground-muted)] hover:bg-[var(--surface-subtle)] disabled:cursor-not-allowed"
              aria-label="Alternar lista de unidades consumidoras"
            >
              <span className="material-symbols-outlined !text-[18px]">
                {isOpen ? "expand_less" : "expand_more"}
              </span>
            </button>
          )}
        </div>

        {isOpen ? (
          <div
            id={listboxId}
            role="listbox"
            className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] p-1 shadow-[var(--shadow-lg)]"
          >
            {isSearching ? (
              <div className="px-3 py-4 text-sm text-[var(--foreground-muted)]">
                Buscando UCs...
              </div>
            ) : filteredUcs.length === 0 ? (
              <div className="px-3 py-4 text-sm text-[var(--foreground-muted)]">
                Nenhuma UC encontrada.
              </div>
            ) : (
              filteredUcs.map((uc) => {
                const isSelected = selectedUc?.id === uc.id;
                return (
                  <button
                    key={uc.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(uc)}
                    className={`flex w-full flex-col gap-1 rounded-sm px-3 py-2.5 text-left text-sm transition hover:bg-[var(--surface-subtle)] ${
                      isSelected
                        ? "bg-[var(--surface-subtle)] text-[var(--text-accent-teal)]"
                        : ""
                    }`}
                  >
                    <span className="font-semibold">
                      {String(uc.id).padStart(3, "0")} - {uc.identificador}
                    </span>
                    <span className="text-xs text-[var(--foreground-muted)]">
                      {uc.instituicaoNome} / {uc.tipoDespesaNome} / {uc.fornecedorNome}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        ) : null}
      </div>
      {selectedUc ? (
        <p className="text-xs font-semibold text-[var(--text-accent-teal)]">
          UC selecionada: {String(selectedUc.id).padStart(3, "0")} -{" "}
          {selectedUc.identificador}
        </p>
      ) : null}
      {error ? <p className="text-sm font-medium text-[#C23D3D]">{error}</p> : null}
    </div>
  );
}

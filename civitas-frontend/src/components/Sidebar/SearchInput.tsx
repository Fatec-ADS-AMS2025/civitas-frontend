import React from "react";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoFocus?: boolean;
};

export default function SearchInput({
  value,
  onChange,
  onKeyDown,
  placeholder = "Buscar funcionalidade...",
  autoFocus = false,
}: SearchInputProps) {
  return (
    <div className="flex items-center gap-2 rounded-sm border border-[var(--search-input-border)] bg-[var(--search-input-bg)] px-3 py-2 shadow-sm">
      <span className="material-symbols-outlined text-[var(--search-input-icon)]">search</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="search-drawer-input font-detail w-full border-none bg-transparent text-sm text-[var(--search-input-text)] outline-none placeholder:text-[var(--search-input-placeholder)]"
        aria-label="Buscar funcionalidade na navegacao"
      />
    </div>
  );
}

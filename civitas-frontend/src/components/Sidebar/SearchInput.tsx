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
    <div className="flex items-center gap-2 rounded-xl border border-[#D4E4E7] bg-white px-3 py-2 shadow-sm">
      <span className="material-symbols-outlined text-[#4A6A74]">search</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="search-drawer-input font-detail w-full border-none bg-transparent text-sm text-[#1E3640] outline-none placeholder:text-[#8EA1A9]"
        aria-label="Buscar funcionalidade na navegacao"
      />
    </div>
  );
}

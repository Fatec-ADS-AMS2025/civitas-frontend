import React, { useEffect, useState, useRef } from "react";

type User = {
  id: number;
  nome: string;
  cpf: string;
  matricula: string;
  cidade: string;
  estado: string;
  tipo: "Administrador" | "Cidadão" | "Funcionário";
};

type SearchBarProps = {
  data: User[];
  onSearch: (results: User[]) => void;
  onCadastrar?: () => void;
};

const normalizeText = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .toLowerCase();

const onlyDigits = (text: string) => text.replace(/\D/g, "");

const SearchBar: React.FC<SearchBarProps> = ({ data, onSearch, onCadastrar }) => {
  const [filters, setFilters] = useState({
    nome: "",
    cpf: "",
    cidade: "",
    estado: "",
    tipo: "",
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeInput, setActiveInput] = useState<"nome" | "cpf" | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const blurTimerRef = useRef<number | null>(null);

  // Filtra e envia resultados sempre que filtros mudarem
  useEffect(() => {
    const normalizedNome = normalizeText(filters.nome);
    const normalizedCpf = onlyDigits(filters.cpf);
    const normalizedCidade = normalizeText(filters.cidade);
    const normalizedEstado = normalizeText(filters.estado);
    const tipoFiltro = filters.tipo;

    const filtered = data.filter((u) => {
      const matchNome = normalizedNome
        ? normalizeText(u.nome).includes(normalizedNome)
        : true;
      const matchCpf = normalizedCpf
        ? onlyDigits(u.cpf).includes(normalizedCpf)
        : true;
      const matchCidade = normalizedCidade
        ? normalizeText(u.cidade).includes(normalizedCidade)
        : true;
      const matchEstado = normalizedEstado
        ? normalizeText(u.estado).includes(normalizedEstado)
        : true;
      const matchTipo = tipoFiltro ? u.tipo === tipoFiltro : true;

      return matchNome && matchCpf && matchCidade && matchEstado && matchTipo;
    });

    onSearch(filtered);
  }, [filters, data, onSearch]);

  // Sugestões para autocomplete (exibe top 5)
  useEffect(() => {
    if (activeInput === "nome" && filters.nome.trim() !== "") {
      const term = normalizeText(filters.nome);
      const matches = data
        .filter((u) => normalizeText(u.nome).includes(term))
        .slice(0, 5);
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else if (activeInput === "cpf" && filters.cpf.trim() !== "") {
      const term = onlyDigits(filters.cpf);
      const matches = data
        .filter((u) => onlyDigits(u.cpf).includes(term))
        .slice(0, 5);
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [filters.nome, filters.cpf, activeInput, data]);

  // inicializa com todos os dados (quando montar)
  useEffect(() => {
    onSearch(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (key: keyof typeof filters, value: string) => {
    setFilters((p) => ({ ...p, [key]: value }));
  };

  const handleSuggestionClick = (user: User) => {
    // preenche ambos (nome e cpf) com o usuário selecionado e fecha sugestões
    setFilters({
      nome: user.nome,
      cpf: user.cpf,
      cidade: filters.cidade,
      estado: filters.estado,
      tipo: filters.tipo,
    });
    setShowSuggestions(false);
    setActiveInput(null);
    onSearch([user]);
  };

  const clearFilters = () => {
    setFilters({ nome: "", cpf: "", cidade: "", estado: "", tipo: "" });
    setShowAdvanced(false);
    setShowSuggestions(false);
    setActiveInput(null);
  };

  const handleInputFocus = (which: "nome" | "cpf") => {
    if (blurTimerRef.current) {
      window.clearTimeout(blurTimerRef.current);
      blurTimerRef.current = null;
    }
    setActiveInput(which);
    // recomputa sugestões imediatamente
    // (o useEffect de sugestões já roda por causa do activeInput)
  };

  const handleInputBlur = () => {
    // Delay pequeno para permitir clicar na sugestão
    blurTimerRef.current = window.setTimeout(() => {
      setShowSuggestions(false);
      setActiveInput(null);
    }, 120);
  };

  return (
    <div className="bg-[#2B2B2B] rounded-2xl p-5 shadow-lg mb-6" ref={containerRef}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="text-white w-full sm:w-auto">
          <p className="font-semibold">Busca:</p>
          <p className="text-xs text-gray-300">Digite nome ou CPF — resultados já aparecem</p>
        </div>

        <div className="relative flex flex-wrap gap-3 flex-1">
          {/* Nome */}
          <div className="relative">
            <input
              type="text"
              placeholder="Nome"
              value={filters.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
              onFocus={() => handleInputFocus("nome")}
              onBlur={handleInputBlur}
              className="rounded-full px-4 py-2 text-sm w-44 sm:w-56 outline-none"
            />
          </div>

          {/* CPF */}
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              placeholder="CPF (só números ou com pontos)"
              value={filters.cpf}
              onChange={(e) => handleChange("cpf", e.target.value)}
              onFocus={() => handleInputFocus("cpf")}
              onBlur={handleInputBlur}
              className="rounded-full px-4 py-2 text-sm w-40 sm:w-48 outline-none"
            />
          </div>

          {/* sugestões (aparece abaixo dos inputs) */}
          {showSuggestions && suggestions.length > 0 && (
            <ul
              className="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg shadow-lg z-50 max-h-56 overflow-auto"
              onMouseDown={(e) => {
                // evita que o blur aconteça antes do clique
                e.preventDefault();
              }}
            >
              {suggestions.map((s) => (
                <li
                  key={s.id}
                  onMouseDown={() => handleSuggestionClick(s)}
                  className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between"
                >
                  <span>{s.nome}</span>
                  <span className="text-gray-500 text-sm">{s.cpf}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => (onCadastrar ? onCadastrar() : alert("Ir para cadastro"))}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-2 rounded-full flex items-center gap-2 transition"
          >
            <span className="material-symbols-outlined text-white">add</span>
            Cadastrar
          </button>

          <button
            onClick={() => setShowAdvanced((s) => !s)}
            className="bg-transparent border border-gray-400 hover:bg-gray-800 text-white font-semibold px-5 py-2 rounded-full flex items-center gap-2 transition"
          >
            <span className="material-symbols-outlined text-white">filter_alt</span>
            {showAdvanced ? "Ocultar Filtros" : "Filtrar"}
          </button>

          <button
            onClick={clearFilters}
            className="bg-transparent border border-gray-400 hover:bg-gray-800 text-white font-semibold px-5 py-2 rounded-full transition"
          >
            Limpar
          </button>
        </div>
      </div>

      {/* Filtros avançados */}
      {showAdvanced && (
        <div className="mt-5 flex flex-wrap gap-3 border-t border-gray-600 pt-4">
          <input
            type="text"
            placeholder="Cidade"
            value={filters.cidade}
            onChange={(e) => handleChange("cidade", e.target.value)}
            className="rounded-full px-4 py-2 text-sm w-40 sm:w-48 outline-none"
          />
          <input
            type="text"
            placeholder="Estado"
            value={filters.estado}
            onChange={(e) => handleChange("estado", e.target.value)}
            className="rounded-full px-4 py-2 text-sm w-28 sm:w-32 outline-none"
          />
          <select
            value={filters.tipo}
            onChange={(e) => handleChange("tipo", e.target.value)}
            className="rounded-full px-4 py-2 text-sm w-40 outline-none"
          >
            <option value="">Tipo</option>
            <option value="Administrador">Administrador</option>
            <option value="Cidadão">Cidadão</option>
            <option value="Funcionário">Funcionário</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default SearchBar;

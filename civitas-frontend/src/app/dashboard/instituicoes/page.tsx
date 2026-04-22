"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";
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
import { instituicaoService } from "@/hooks/instituicao";
import { secretariaService } from "@/hooks/secretaria";
import { tipoInstituicaoService } from "@/hooks/tipoInstituicao";
import InstituicaoDTO from "@/models/instituicao";
import SecretariaDTO from "@/models/secretaria";
import TipoInstituicaoDTO from "@/models/tipoInstituicao";
import { SkeletonTable } from "@/components/skeleton";

type Instituicao = InstituicaoDTO;
type Secretaria = SecretariaDTO;
type TipoInstituicao = TipoInstituicaoDTO;
type InstituicaoRow = Instituicao & {
  situacaoLabel: string;
  secretariaLabel: string;
  tipoInstituicaoLabel: string;
};

type InstituicaoPageData = {
  instituicoes: Instituicao[];
  secretarias: Secretaria[];
  tiposInstituicao: TipoInstituicao[];
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
  { id: "nomeRazaoSocial", label: "Razao Social" },
  { id: "cnpj", label: "CNPJ" },
  { id: "tipoInstituicaoLabel", label: "Tipo de Instituicao" },
  { id: "secretariaLabel", label: "Secretaria" },
  { id: "cidade", label: "Cidade" },
  { id: "estado", label: "Estado" },
  { id: "situacaoLabel", label: "Situacao" },
];

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
  tiposInstituicao: TipoInstituicao[]
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

  return instituicoes.map((instituicao) => {
    const secretariaId = instituicao.idSecretaria;
    const tipoInstituicaoId = instituicao.idTipoInstituicao;

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
    };
  });
};

const fetchInstituicaoPageData = async (): Promise<InstituicaoPageData> => {
  const [instituicoes, secretarias, tiposInstituicao] = await Promise.all([
    instituicaoService.getAll(),
    secretariaService.getAll(),
    tipoInstituicaoService.getAll(),
  ]);

  return {
    instituicoes,
    secretarias,
    tiposInstituicao,
  };
};

export default function Page() {
  const [instituicoes, setInstituicoes] = useState<InstituicaoRow[]>([]);
  const [filteredData, setFilteredData] = useState<InstituicaoRow[]>([]);
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [tiposInstituicao, setTiposInstituicao] = useState<TipoInstituicao[]>([]);
  const [campos, setCampos] = useState<FieldConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        required: true,
        validate: validateDigitsLength("CNPJ", 14),
      },
      {
        key: "cep",
        label: "CEP",
        placeholder: "00000-000",
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

  const refreshInstituicoes = async () => {
    const pageData = await fetchInstituicaoPageData();
    const rows = mapInstituicaoRows(
      pageData.instituicoes,
      pageData.secretarias,
      pageData.tiposInstituicao
    );

    setSecretarias(pageData.secretarias);
    setTiposInstituicao(pageData.tiposInstituicao);
    setInstituicoes(rows);
    setFilteredData(rows);
  };

  useEffect(() => {
    setCampos(buildInstituicaoCampos(secretariaOptions, tipoInstituicaoOptions));
  }, [secretariaOptions, tipoInstituicaoOptions]);

  useEffect(() => {
    const loadInstituicoes = async () => {
      try {
        setLoading(true);
        const pageData = await fetchInstituicaoPageData();
        const rows = mapInstituicaoRows(
          pageData.instituicoes,
          pageData.secretarias,
          pageData.tiposInstituicao
        );

        setSecretarias(pageData.secretarias);
        setTiposInstituicao(pageData.tiposInstituicao);
        setInstituicoes(rows);
        setFilteredData(rows);
        setError(null);
      } catch (err) {
        console.error("Erro ao carregar instituicoes:", err);
        setInstituicoes([]);
        setFilteredData([]);
        setSecretarias([]);
        setTiposInstituicao([]);
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
    return <SkeletonTable rows={5} cols={4} />;
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          {error}
        </div>
      )}

      <SearchBar
        model={novaInstituicao}
        dados={instituicoes}
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
          allData: instituicoes,
        }}
        paginationEnabled={false}
      />
    </>
  );
}

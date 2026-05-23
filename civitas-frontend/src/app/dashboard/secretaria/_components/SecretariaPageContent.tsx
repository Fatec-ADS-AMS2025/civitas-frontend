"use client";

import Table from "@/components/Table/table";
import { SkeletonTable } from "@/components/skeleton";
import type { useSecretariaPage } from "@/hooks/useSecretariaPage";
import {
  secretariaColumns,
  secretariaFormFields,
} from "./secretariaConfig";
import SecretariaFilters from "./SecretariaFilters";
import SecretariaInstituicoesView from "./SecretariaInstituicoesView";
import SecretariaRelationshipCards from "./SecretariaRelationshipCards";

type SecretariaPageContentProps = ReturnType<typeof useSecretariaPage>;

function SecretariaErrorAlert({ message }: { message: string }) {
  return (
    <div className="mb-4 rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
      {message}
    </div>
  );
}

export default function SecretariaPageContent({
  secretarias,
  filteredData,
  cardFilteredSecretarias,
  secretariaMetrics,
  cardFilter,
  setFilteredData,
  setCardFilter,
  loading,
  error,
  handleCreate,
  handleUpdate,
  handleDelete,
}: SecretariaPageContentProps) {
  if (loading) {
    return <SkeletonTable rows={5} cols={4} />;
  }

  return (
    <>
      {error ? <SecretariaErrorAlert message={error} /> : null}

      <SecretariaRelationshipCards
        secretarias={secretarias}
        metrics={secretariaMetrics}
        selectedFilter={cardFilter}
        onFilterChange={setCardFilter}
      />

      <SecretariaFilters
        data={cardFilteredSecretarias}
        setData={setFilteredData}
        onCadastrar={handleCreate}
      />

      <Table
        data={filteredData}
        columns={secretariaColumns}
        onEdit={handleUpdate}
        onDelete={handleDelete}
        formFields={secretariaFormFields}
        displayMode="cards"
        cardConfig={{
          icon: "corporate_fare",
          tone: "teal",
          eyebrow: (row) => `Secretaria #${String(row.idSecretaria).padStart(3, "0")}`,
          title: (row) => row.nome || row.descricao || "Secretaria sem nome",
          subtitle: (row) => row.descricao,
          badgeColumnId: "situacaoLabel",
          primaryFields: [
            { label: "CNPJ", columnId: "cnpj", icon: "badge" },
            { label: "Telefone", columnId: "telefone", icon: "call" },
            {
              label: "Instituicoes",
              value: (row) => row.totalInstituicoes,
              icon: "account_balance",
              tone: "success",
            },
          ],
          relationshipFields: [
            {
              label: "Localidade",
              value: (row) =>
                [row.cidade, row.estado].filter(Boolean).join(" / ") ||
                "Localidade nao informada",
              icon: "location_city",
            },
            {
              label: "Endereco",
              value: (row) =>
                [row.logradouro, row.numero, row.bairro].filter(Boolean).join(", ") ||
                "Endereco nao informado",
              icon: "home_work",
            },
            { label: "E-mail", value: (row) => row.email || "-", icon: "mail" },
          ],
        }}
        renderModalExtra={(row, mode) =>
          mode === "view" ? <SecretariaInstituicoesView secretaria={row} /> : null
        }
      />
    </>
  );
}

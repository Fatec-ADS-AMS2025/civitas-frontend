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
  textFilters,
  setTextFilters,
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
        filters={textFilters}
        setFilters={setTextFilters}
        onCadastrar={handleCreate}
      />

      <Table
        data={filteredData}
        columns={secretariaColumns}
        onEdit={handleUpdate}
        onDelete={handleDelete}
        formFields={secretariaFormFields}
        renderModalExtra={(row, mode) =>
          mode === "view" ? <SecretariaInstituicoesView secretaria={row} /> : null
        }
      />
    </>
  );
}

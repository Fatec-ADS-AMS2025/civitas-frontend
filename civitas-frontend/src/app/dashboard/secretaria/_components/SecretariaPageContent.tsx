"use client";

import { SearchBar } from "@/components/Table/searchbar";
import Table from "@/components/Table/table";
import { SkeletonTable } from "@/components/skeleton";
import type { useSecretariaPage } from "@/hooks/useSecretariaPage";
import {
  novaSecretaria,
  secretariaColumns,
  secretariaFormFields,
} from "./secretariaConfig";
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
  campos,
  setFilteredData,
  setCardFilter,
  setCampos,
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

      <SearchBar
        model={novaSecretaria}
        dados={cardFilteredSecretarias}
        setDados={setFilteredData}
        campos={campos}
        formFields={secretariaFormFields}
        setCampos={setCampos}
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

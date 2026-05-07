"use client";

import { useDespesaPage } from "./_components/useDespesaPage";
import { DespesaContent } from "./_components/DespesaContent";

export default function Page() {
  const {
    filteredDespesas,
    loading,
    handleDelete,
    setEditing,
    setViewing,
  } = useDespesaPage();

  return (
    <div className="space-y-6">
      <DespesaContent
        data={filteredDespesas}
        loading={loading}
        onEdit={setEditing}
        onView={setViewing}
        onDelete={handleDelete}
      />
    </div>
  );
}
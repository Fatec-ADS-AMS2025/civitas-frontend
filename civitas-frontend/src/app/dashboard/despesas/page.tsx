"use client";

import { DespesaContent } from "./_components/DespesaContent";
import { useDespesaPage } from "./_components/useDespesaPage";

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

import type { Dispatch, SetStateAction } from "react";
import Form, { type FieldConfig as ModalFieldConfig } from "@/components/Form/form";
import Modal from "@/components/modal";
import type { DespesaDashboardRow } from "@/hooks/useDespesasDashboard";
import { EMPTY_DESPESA_FORM } from "../despesas.constants";
import { buildDespesaFormObject } from "../despesas.utils";

type DespesaCrudModalsProps = {
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: Dispatch<SetStateAction<boolean>>;
  editingDespesa: DespesaDashboardRow | null;
  setEditingDespesa: Dispatch<SetStateAction<DespesaDashboardRow | null>>;
  viewingDespesa: DespesaDashboardRow | null;
  setViewingDespesa: Dispatch<SetStateAction<DespesaDashboardRow | null>>;
  fields: ModalFieldConfig[];
  onCreateSubmit: (formData: Record<string, unknown>) => Promise<void>;
  onEditSubmit: (formData: Record<string, unknown>) => Promise<void>;
};

export default function DespesaCrudModals({
  isCreateModalOpen,
  setIsCreateModalOpen,
  editingDespesa,
  setEditingDespesa,
  viewingDespesa,
  setViewingDespesa,
  fields,
  onCreateSubmit,
  onEditSubmit,
}: DespesaCrudModalsProps) {
  return (
    <>
      {isCreateModalOpen ? (
        <Modal value={isCreateModalOpen} setValue={setIsCreateModalOpen}>
          <Form
            object={EMPTY_DESPESA_FORM}
            name="despesa"
            type="create"
            fields={fields}
            onCancel={() => setIsCreateModalOpen(false)}
            onConfirm={onCreateSubmit}
          />
        </Modal>
      ) : null}

      {editingDespesa ? (
        <Modal value={true} setValue={() => setEditingDespesa(null)}>
          <Form
            object={buildDespesaFormObject(editingDespesa)}
            name="despesa"
            type="edit"
            fields={fields}
            onCancel={() => setEditingDespesa(null)}
            onConfirm={onEditSubmit}
          />
        </Modal>
      ) : null}

      {viewingDespesa ? (
        <Modal value={true} setValue={() => setViewingDespesa(null)}>
          <Form
            object={buildDespesaFormObject(viewingDespesa)}
            name="despesa"
            type="view"
            fields={fields}
            onCancel={() => setViewingDespesa(null)}
          />
        </Modal>
      ) : null}
    </>
  );
}

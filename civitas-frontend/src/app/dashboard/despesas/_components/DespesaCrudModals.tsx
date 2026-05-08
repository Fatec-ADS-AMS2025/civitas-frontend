import type { Dispatch, SetStateAction } from "react";
import Form from "@/components/Form/form";
import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";
import Modal from "@/components/modal";
import type { DespesaDashboardRow } from "@/hooks/useDespesasDashboard";
import { buildDespesaFormObject } from "../despesas.utils";
import DespesaForm, {
  type DespesaResponsavelOption,
  type DespesaUcOption,
} from "./DespesaForm";

type DespesaCrudModalsProps = {
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: Dispatch<SetStateAction<boolean>>;
  editingDespesa: DespesaDashboardRow | null;
  setEditingDespesa: Dispatch<SetStateAction<DespesaDashboardRow | null>>;
  viewingDespesa: DespesaDashboardRow | null;
  setViewingDespesa: Dispatch<SetStateAction<DespesaDashboardRow | null>>;
  unidadesConsumidoras: DespesaUcOption[];
  usuarios: DespesaResponsavelOption[];
  viewFields: ModalFieldConfig[];
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
  unidadesConsumidoras,
  usuarios,
  viewFields,
  onCreateSubmit,
  onEditSubmit,
}: DespesaCrudModalsProps) {
  return (
    <>
      {isCreateModalOpen ? (
        <Modal value={isCreateModalOpen} setValue={setIsCreateModalOpen}>
          <DespesaForm
            mode="create"
            ucs={unidadesConsumidoras}
            usuarios={usuarios}
            onCancel={() => setIsCreateModalOpen(false)}
            onConfirm={onCreateSubmit}
          />
        </Modal>
      ) : null}

      {editingDespesa ? (
        <Modal value={true} setValue={() => setEditingDespesa(null)}>
          <DespesaForm
            mode="edit"
            ucs={unidadesConsumidoras}
            usuarios={usuarios}
            initialValues={buildDespesaFormObject(editingDespesa)}
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
            fields={viewFields}
            hiddenFields={[]}
            onCancel={() => setViewingDespesa(null)}
          />
        </Modal>
      ) : null}
    </>
  );
}

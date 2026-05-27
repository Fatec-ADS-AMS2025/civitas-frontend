import { useState, type Dispatch, type SetStateAction } from "react";
import Form from "@/components/Form/form";
import type { FieldConfig as ModalFieldConfig } from "@/components/Form/form";
import Modal from "@/components/modal";
import type { DespesaDashboardRow } from "@/hooks/useDespesasDashboard";
import { buildDespesaFormObject } from "../despesas.utils";
import DespesaDetailsView from "./DespesaDetailsView";
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
  const [createFormVariant, setCreateFormVariant] = useState<"list" | "combobox">("list");

  return (
    <>
      {isCreateModalOpen ? (
        <Modal value={isCreateModalOpen} setValue={setIsCreateModalOpen}>
          <div className="flex h-full min-h-0 flex-col">
            <div className="flex flex-shrink-0 items-center justify-end gap-2 border-b border-[var(--border-soft)] bg-[var(--surface-elevated)] px-6 py-3">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
                Versao do formulario
              </span>
              <div className="inline-flex rounded-sm border border-[var(--border-default)] bg-[var(--surface-subtle)] p-1">
                <button
                  type="button"
                  onClick={() => setCreateFormVariant("list")}
                  className={`rounded-sm px-3 py-1.5 text-xs font-semibold transition ${
                    createFormVariant === "list"
                      ? "bg-[var(--surface-elevated)] text-[var(--secundary-1)] shadow-[var(--shadow-xs)]"
                      : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  Padrao
                </button>
                <button
                  type="button"
                  onClick={() => setCreateFormVariant("combobox")}
                  className={`rounded-sm px-3 py-1.5 text-xs font-semibold transition ${
                    createFormVariant === "combobox"
                      ? "bg-[var(--surface-elevated)] text-[var(--secundary-1)] shadow-[var(--shadow-xs)]"
                      : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  Combobox UC
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1">
              <DespesaForm
                mode="create"
                ucs={unidadesConsumidoras}
                usuarios={usuarios}
                ucSelectorVariant={createFormVariant}
                onCancel={() => setIsCreateModalOpen(false)}
                onConfirm={onCreateSubmit}
              />
            </div>
          </div>
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
            extraContent={<DespesaDetailsView despesa={viewingDespesa} />}
            onCancel={() => setViewingDespesa(null)}
          />
        </Modal>
      ) : null}
    </>
  );
}

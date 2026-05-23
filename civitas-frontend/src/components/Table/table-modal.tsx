import Form from "../Form/form";
import type { FormMode, FieldConfig as ModalFieldConfig, ValidationFn } from "../Form/form";
import Modal from "../modal";
import { showToast } from "@/hooks/useToast";
import { getResolvedId } from "./table-record";
import type { TableRow } from "./table-types";

type TableModalProps<T extends TableRow> = {
  data: T[];
  pageName: string;
  action: FormMode | null;
  row: T | null;
  formFields?: ModalFieldConfig[];
  formValidationSchema?: Record<string, ValidationFn>;
  formHiddenFields?: string[];
  renderModalExtra?: (row: T, mode: FormMode) => React.ReactNode;
  onClose: () => void;
  onEdit?: (id: number, data: Partial<T> & Record<string, unknown>) => Promise<unknown>;
  onDelete?: (id: number) => Promise<void>;
};

export function TableModal<T extends TableRow>({
  data,
  pageName,
  action,
  row,
  formFields,
  formValidationSchema,
  formHiddenFields,
  renderModalExtra,
  onClose,
  onEdit,
  onDelete,
}: TableModalProps<T>) {
  if (!action || !row) return null;

  return (
    <Modal setValue={onClose} value={action != null}>
      <Form
        object={row}
        name={pageName}
        camps={data.length > 0 ? Object.keys(data[0] as Record<string, unknown>) : []}
        type={action}
        fields={formFields}
        validationSchema={formValidationSchema}
        hiddenFields={formHiddenFields}
        extraContent={renderModalExtra ? renderModalExtra(row, action) : undefined}
        onCancel={onClose}
        onConfirm={async (formData) => {
          try {
            if (action === "delete") {
              if (!window.confirm(`Tem certeza que deseja excluir este ${pageName}?`)) return;
              if (onDelete) await onDelete(getResolvedId(row));
            } else if (action === "edit" && onEdit) {
              await onEdit(getResolvedId(row), formData as Partial<T> & Record<string, unknown>);
            }
            onClose();
          } catch (modalError) {
            const message =
              modalError instanceof Error ? modalError.message : "Erro na operacao. Tente novamente.";
            showToast(message, "error");
          }
        }}
      />
    </Modal>
  );
}

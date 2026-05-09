import ExportModal from "@/components/Table/export-modal";
import type { TableExportOptions } from "@/components/Table/export-types";
import {
  DESPESAS_EXPORT_COLUMNS,
  DESPESAS_EXPORT_TITLE,
} from "../despesas.constants";

type DespesasExportModalProps = {
  open: boolean;
  filteredCount: number;
  allCount: number;
  isGenerating: boolean;
  onClose: () => void;
  onGenerate: (options: TableExportOptions) => Promise<void>;
};

export default function DespesasExportModal({
  open,
  filteredCount,
  allCount,
  isGenerating,
  onClose,
  onGenerate,
}: DespesasExportModalProps) {
  if (allCount <= 0) {
    return null;
  }

  return (
    <ExportModal
      open={open}
      title={DESPESAS_EXPORT_TITLE}
      columns={DESPESAS_EXPORT_COLUMNS}
      filteredCount={filteredCount}
      allCount={allCount}
      isGenerating={isGenerating}
      onClose={onClose}
      onGenerate={onGenerate}
    />
  );
}

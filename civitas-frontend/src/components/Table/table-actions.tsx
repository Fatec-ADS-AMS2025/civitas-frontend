import type { FormMode } from "../Form/form";
import type { TableRow } from "./table-types";

type TableActionsProps<T extends TableRow> = {
  row: T;
  actions: string[];
  onOpen: (action: FormMode, row: T) => void;
};

const actionButtonClassName =
  "civitas-table__action flex h-9 w-9 cursor-pointer items-center justify-center rounded-sm border transition-all duration-[var(--motion-duration-fast)] focus-visible:outline-none focus-visible:ring-4";

function ActionButton<T extends TableRow>({
  icon,
  action,
  row,
  tone = "default",
  onOpen,
}: {
  icon: string;
  action: FormMode;
  row: T;
  tone?: "default" | "danger";
  onOpen: (action: FormMode, row: T) => void;
}) {
  const toneClassName =
    tone === "danger"
      ? "civitas-action--danger"
      : "border-[var(--border-soft)] bg-[var(--surface-elevated)] text-[var(--secundary-1)] hover:bg-[var(--surface-subtle)] focus-visible:ring-[var(--focus-ring)]";

  return (
    <button type="button" onClick={() => onOpen(action, row)} className={`${actionButtonClassName} ${toneClassName}`}>
      <span className="material-symbols-outlined !text-[21px]">{icon}</span>
    </button>
  );
}

export function TableActions<T extends TableRow>({ row, actions, onOpen }: TableActionsProps<T>) {
  if (actions.length === 0) return null;

  return (
    <>
      {actions.includes("view") ? <ActionButton icon="visibility" action="view" row={row} onOpen={onOpen} /> : null}
      {actions.includes("edit") ? <ActionButton icon="edit" action="edit" row={row} onOpen={onOpen} /> : null}
      {actions.includes("delete") ? (
        <ActionButton icon="delete" action="delete" row={row} tone="danger" onOpen={onOpen} />
      ) : null}
    </>
  );
}

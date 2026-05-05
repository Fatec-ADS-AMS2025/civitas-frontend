import type { FeedbackState } from "./configuracoes.types";

type ConfiguracoesFeedbackProps = {
  feedback: FeedbackState;
};

export default function ConfiguracoesFeedback({
  feedback,
}: ConfiguracoesFeedbackProps) {
  if (!feedback) return null;

  const classes =
    feedback.type === "success"
      ? "border-[var(--border-accent-teal)] bg-[var(--surface-success-soft)] text-[var(--text-accent-teal)]"
      : "border-[var(--border-danger)] bg-[var(--surface-danger-accent)] text-[var(--text-danger-strong)]";

  return (
    <div className={`rounded-sm border px-4 py-3 text-sm ${classes}`}>
      {feedback.message}
    </div>
  );
}

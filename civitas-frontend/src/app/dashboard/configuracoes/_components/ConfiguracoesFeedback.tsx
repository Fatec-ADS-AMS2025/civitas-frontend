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
      ? "civitas-card-soft civitas-card-soft--success text-[var(--tone-success-text)]"
      : "civitas-card-soft civitas-card-soft--danger text-[var(--tone-danger-text)]";

  return (
    <div
      className={`rounded-sm px-4 py-3 text-sm ${classes}`}
      role={feedback.type === "success" ? "status" : "alert"}
    >
      {feedback.message}
    </div>
  );
}

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
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : "border-red-200 bg-red-50 text-red-900";

  return (
    <div className={`rounded-sm border px-4 py-3 text-sm ${classes}`}>
      {feedback.message}
    </div>
  );
}

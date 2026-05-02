"use client";

type InstituicoesErrorAlertProps = {
  message: string;
};

export default function InstituicoesErrorAlert({
  message,
}: InstituicoesErrorAlertProps) {
  return (
    <div className="mb-4 rounded-sm border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
      {message}
    </div>
  );
}

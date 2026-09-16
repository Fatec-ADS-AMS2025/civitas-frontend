"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import Button from "@/components/button";
import { Input } from "@/components/Input";
import { accountAccessService, InvalidPasswordResetTokenError } from "@/hooks/accountAccessService";
import { useAccountAccessAction } from "@/hooks/useAccountAccessAction";
import { validatePassword, validatePasswordConfirmation } from "@/lib/account-access-validation";

type ResetPasswordErrors = {
  password: string;
  passwordConfirmation: string;
};

const SUCCESS_MESSAGE = "Senha alterada com sucesso. Você já pode entrar no sistema.";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState<ResetPasswordErrors>({ password: "", passwordConfirmation: "" });
  const [isResetLinkInvalid, setIsResetLinkInvalid] = useState(false);
  const { isLoading, error, successMessage, execute, clearMessages } = useAccountAccessAction();
  const hasToken = token.trim() !== "";
  const isFormAvailable = hasToken && !isResetLinkInvalid;

  const updatePassword = useCallback(
    (field: keyof ResetPasswordErrors, value: string) => {
      if (field === "password") setPassword(value);
      else setPasswordConfirmation(value);

      if (errors[field]) setErrors((current) => ({ ...current, [field]: "" }));
      if (error || successMessage) clearMessages();
    },
    [clearMessages, error, errors, successMessage],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading || !isFormAvailable) return;

    const nextErrors = {
      password: validatePassword(password),
      passwordConfirmation: validatePasswordConfirmation(password, passwordConfirmation),
    };

    setErrors(nextErrors);
    clearMessages();

    if (Object.values(nextErrors).some(Boolean)) return;

    await execute(() => accountAccessService.resetPassword({ token, password }), SUCCESS_MESSAGE, {
      suppressError: (requestError) => {
        if (!(requestError instanceof InvalidPasswordResetTokenError)) return false;

        setIsResetLinkInvalid(true);
        return true;
      },
    });
  };

  return (
    <div className="min-h-screen w-full bg-[var(--surface-page)]">
      <div className="relative mx-auto flex min-h-screen w-full overflow-x-hidden">
        <div className="m-0 hidden w-1/2 items-center justify-center border-r border-[var(--border-soft)] bg-[var(--surface-subtle)] p-8 lg:flex">
          <div className="flex w-full flex-col items-center">
            <div className="mb-8 text-center">
              <p className="text-sm font-medium uppercase tracking-[0.12em] text-[var(--foreground-soft)]">
                Nova senha
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
                Proteja seu acesso ao <span className="text-[var(--secundary-1)]">Civitas</span>
              </h1>
              <p className="mt-3 text-sm text-[var(--foreground-muted)]">
                Defina uma nova senha para voltar a acessar sua conta.
              </p>
            </div>
            <div className="flex w-full justify-center">
              <img src="/mnote.png" alt="Pessoa usando notebook" className="h-auto w-full max-w-md opacity-95" />
            </div>
          </div>
        </div>

        <div className="flex min-h-screen w-full items-start justify-center overflow-x-hidden bg-[var(--secundary-1)] px-4 py-8 sm:px-5 sm:py-10 lg:w-1/2 lg:items-center lg:px-8 lg:py-12">
          <div className="w-full max-w-[min(28rem,calc(100vw-2rem))] rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-6 shadow-[var(--shadow-sm)] sm:max-w-md sm:p-8">
            <div className="mb-8">
              <div className="mb-6 flex items-center gap-3">
                <img src="/logo1.png" alt="Civitas Logo" className="h-10 w-10 object-contain" />
                <span className="font-semibold text-[var(--secundary-1)]">Civitas</span>
              </div>
              <h2 className="mb-3 text-[28px] font-semibold text-[var(--foreground)] sm:text-[34px]">
                Redefinir senha
              </h2>
              <p className="text-sm text-[var(--foreground-muted)]">
                Sua senha deve ter ao menos 8 caracteres, uma letra e um número.
              </p>
              {!hasToken && (
                <div className="civitas-error-banner mt-3 px-3 py-2.5 text-sm" role="alert">
                  O link de redefinição está inválido ou incompleto. Solicite um novo link de recuperação.
                </div>
              )}
              {isResetLinkInvalid && (
                <div className="civitas-error-banner mt-3 px-3 py-2.5 text-sm" role="alert">
                  <p>Link de redefinição inválido ou expirado.</p>
                  <Link
                    href="/forgot-password"
                    className="mt-2 inline-block font-semibold underline underline-offset-2"
                  >
                    Solicitar novo link de recuperação
                  </Link>
                </div>
              )}
            </div>

            {isFormAvailable && (
              <form onSubmit={handleSubmit} noValidate aria-busy={isLoading} className="space-y-5">
                {error && (
                  <div className="civitas-error-banner px-3 py-2.5 text-sm" role="alert" aria-live="assertive">
                    {error}
                  </div>
                )}
                {successMessage && (
                  <div
                    className="rounded-sm border border-[var(--tone-success-border)] bg-[var(--tone-success-bg)] px-3 py-2.5 text-sm font-medium text-[var(--tone-success-text)]"
                    role="status"
                    aria-live="polite"
                  >
                    {successMessage}
                  </div>
                )}

                <Input
                  id="reset-password"
                  type="password"
                  label="Nova senha"
                  placeholder="Mínimo de 8 caracteres"
                  value={password}
                  onChange={(event) => updatePassword("password", event.target.value)}
                  disabled={isLoading || !isFormAvailable}
                  autoComplete="new-password"
                  required
                  aria-invalid={Boolean(errors.password)}
                  error={errors.password}
                />
                <Input
                  id="reset-password-confirmation"
                  type="password"
                  label="Confirmar nova senha"
                  placeholder="Repita a nova senha"
                  value={passwordConfirmation}
                  onChange={(event) => updatePassword("passwordConfirmation", event.target.value)}
                  disabled={isLoading || !isFormAvailable}
                  autoComplete="new-password"
                  required
                  aria-invalid={Boolean(errors.passwordConfirmation)}
                  error={errors.passwordConfirmation}
                />

                <Button
                  type="submit"
                  variant="login"
                  disabled={isLoading || !isFormAvailable}
                  className="mt-6 max-w-none"
                >
                  {isLoading ? "Alterando..." : "Alterar senha"}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm font-semibold text-[var(--secundary-1)] underline underline-offset-2 hover:brightness-110"
              >
                Voltar para o login
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 hidden h-2 w-full bg-[var(--secundary-1)] lg:block" />
      </div>
    </div>
  );
}

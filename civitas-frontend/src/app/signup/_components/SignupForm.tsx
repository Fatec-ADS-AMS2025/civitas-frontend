"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import Button from "@/components/button";
import { Input } from "@/components/Input";
import { accountAccessService } from "@/hooks/accountAccessService";
import { useAccountAccessAction } from "@/hooks/useAccountAccessAction";
import {
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordConfirmation,
} from "@/lib/account-access-validation";

type SignupFormState = {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

type SignupFormErrors = Record<keyof SignupFormState, string>;

const INITIAL_FORM: SignupFormState = {
  name: "",
  email: "",
  password: "",
  passwordConfirmation: "",
};

const EMPTY_ERRORS: SignupFormErrors = {
  name: "",
  email: "",
  password: "",
  passwordConfirmation: "",
};

const SUCCESS_MESSAGE = "Cadastro realizado com sucesso. Voce ja pode entrar no sistema.";

export default function SignupForm() {
  const [form, setForm] = useState<SignupFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<SignupFormErrors>(EMPTY_ERRORS);
  const { isLoading, error, successMessage, execute, clearMessages } = useAccountAccessAction();

  const updateField = useCallback(
    (field: keyof SignupFormState, value: string) => {
      setForm((current) => ({ ...current, [field]: value }));
      if (errors[field]) setErrors((current) => ({ ...current, [field]: "" }));
      if (error || successMessage) clearMessages();
    },
    [clearMessages, error, errors, successMessage],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;

    const nextErrors: SignupFormErrors = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      passwordConfirmation: validatePasswordConfirmation(form.password, form.passwordConfirmation),
    };

    setErrors(nextErrors);
    clearMessages();

    if (Object.values(nextErrors).some(Boolean)) return;

    await execute(
      () =>
        accountAccessService.register({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      SUCCESS_MESSAGE,
    );
  };

  return (
    <div className="min-h-screen w-full bg-[var(--surface-page)]">
      <div className="relative mx-auto flex min-h-screen w-full overflow-x-hidden">
        <div className="m-0 hidden w-1/2 items-center justify-center border-r border-[var(--border-soft)] bg-[var(--surface-subtle)] p-8 lg:flex">
          <div className="flex w-full flex-col items-center">
            <div className="mb-8 text-center">
              <p className="text-sm font-medium uppercase tracking-[0.12em] text-[var(--foreground-soft)]">
                Novo acesso
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
                Crie sua conta no <span className="text-[var(--secundary-1)]">Civitas</span>
              </h1>
              <p className="mt-3 text-sm text-[var(--foreground-muted)]">
                Informe seus dados de acesso para iniciar o cadastro.
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
              <h2 className="mb-3 text-[28px] font-semibold text-[var(--foreground)] sm:text-[34px]">Criar conta</h2>
              <p className="text-sm text-[var(--foreground-muted)]">Preencha os dados abaixo para criar seu acesso.</p>
              <p className="mt-3 rounded-sm border border-[var(--tone-amber-border)] bg-[var(--tone-amber-bg)] px-3 py-2.5 text-sm text-[var(--tone-amber-text)]">
                O cadastro publico depende de uma rota especifica que ainda nao foi disponibilizada pela API.
              </p>
            </div>

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
                id="signup-name"
                label="Nome completo"
                placeholder="Informe seu nome"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                disabled={isLoading}
                autoComplete="name"
                required
                aria-invalid={Boolean(errors.name)}
                error={errors.name}
              />
              <Input
                id="signup-email"
                type="email"
                label="E-mail"
                placeholder="Informe o e-mail"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                disabled={isLoading}
                autoComplete="email"
                required
                aria-invalid={Boolean(errors.email)}
                error={errors.email}
              />
              <Input
                id="signup-password"
                type="password"
                label="Senha"
                placeholder="Minimo de 8 caracteres"
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                disabled={isLoading}
                autoComplete="new-password"
                required
                aria-invalid={Boolean(errors.password)}
                error={errors.password}
              />
              <Input
                id="signup-password-confirmation"
                type="password"
                label="Confirmar senha"
                placeholder="Repita a senha"
                value={form.passwordConfirmation}
                onChange={(event) => updateField("passwordConfirmation", event.target.value)}
                disabled={isLoading}
                autoComplete="new-password"
                required
                aria-invalid={Boolean(errors.passwordConfirmation)}
                error={errors.passwordConfirmation}
              />

              <Button type="submit" variant="login" disabled={isLoading} className="mt-6 max-w-none">
                {isLoading ? "Cadastrando..." : "Criar conta"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm font-semibold text-[var(--secundary-1)] underline underline-offset-2 hover:brightness-110"
              >
                Ja tem conta? Entrar
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 hidden h-2 w-full bg-[var(--secundary-1)] lg:block" />
      </div>
    </div>
  );
}

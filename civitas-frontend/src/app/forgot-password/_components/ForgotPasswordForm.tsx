'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/button';
import { Input } from '@/components/Input';
import useForgotPassword from '@/hooks/useForgotPassword';

type FormErrors = {
  email: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateEmail = (email: string) => {
  const normalizedEmail = email.trim();

  if (!normalizedEmail) {
    return 'Informe o e-mail';
  }

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return 'Informe um e-mail valido';
  }

  return '';
};

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FormErrors>({ email: '' });

  const { requestPasswordRecovery, isLoading, error, successMessage, clearMessages } = useForgotPassword();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isLoading) return;

    const emailError = validateEmail(email);
    setErrors({ email: emailError });
    clearMessages();

    if (emailError) {
      return;
    }

    await requestPasswordRecovery({ email });
  };

  return (
    <div className="min-h-screen w-full bg-[var(--surface-page)]">
      <div className="relative mx-auto flex min-h-screen w-full overflow-x-hidden">
        <div className="m-0 hidden w-1/2 items-center justify-center border-r border-[var(--border-soft)] bg-[var(--surface-subtle)] p-8 lg:flex">
          <div className="flex w-full flex-col items-center">
            <div className="mb-8 text-center">
              <p className="text-sm font-medium uppercase tracking-[0.12em] text-[var(--foreground-soft)]">
                Recuperacao de acesso
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
                Retome o acesso ao <span className="text-[var(--secundary-1)]">Civitas</span>
              </h1>
              <p className="mt-3 text-sm text-[var(--foreground-muted)]">
                Informe seu e-mail cadastrado para receber as instrucoes de recuperacao.
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
                Esqueci minha senha
              </h2>
              <p className="text-sm text-[var(--foreground-muted)]">
                Envie a solicitacao para o e-mail vinculado ao seu cadastro.
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
                id="forgot-password-email"
                type="email"
                label="E-mail"
                placeholder="Informe o e-mail"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (errors.email) setErrors({ email: '' });
                  if (error || successMessage) clearMessages();
                }}
                disabled={isLoading}
                autoComplete="email"
                required
                aria-invalid={Boolean(errors.email)}
                error={errors.email}
              />

              <Button type="submit" variant="login" disabled={isLoading} className="mt-6 max-w-none">
                {isLoading && (
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-[rgba(255,255,255,0.45)] border-t-white"
                    aria-hidden="true"
                  />
                )}
                {isLoading ? 'Enviando...' : 'Enviar instrucoes'}
              </Button>
            </form>

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

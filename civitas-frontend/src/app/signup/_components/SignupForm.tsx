"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import Button from "@/components/button";
import { Input } from "@/components/Input";
import { accountAccessService, type RegistrationInput } from "@/hooks/accountAccessService";
import { useAccountAccessAction } from "@/hooks/useAccountAccessAction";
import {
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordConfirmation,
} from "@/lib/account-access-validation";

type FormState = RegistrationInput & { passwordConfirmation: string };
type FormErrors = Record<keyof FormState, string>;
const UFS = new Set([
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
]);
const INITIAL_FORM: FormState = {
  nome: "",
  cpf: "",
  rg: "",
  logradouro: "",
  numero: "",
  bairro: "",
  cidade: "",
  estado: "",
  cep: "",
  email: "",
  senha: "",
  matricula: "",
  passwordConfirmation: "",
};
const EMPTY_ERRORS: FormErrors = Object.fromEntries(Object.keys(INITIAL_FORM).map((key) => [key, ""])) as FormErrors;
const onlyDigits = (value: string) => value.replace(/\D/g, "");
const required = (value: string, label: string) => (value.trim() ? "" : `Informe ${label}`);

const isValidCpf = (cpf: string): boolean => {
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  const calculateDigit = (length: number): number => {
    const sum = cpf
      .slice(0, length)
      .split("")
      .reduce((total, digit, index) => total + Number(digit) * (length + 1 - index), 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  return Number(cpf[9]) === calculateDigit(9) && Number(cpf[10]) === calculateDigit(10);
};

function validate(form: FormState): FormErrors {
  const cpf = onlyDigits(form.cpf);
  const rg = onlyDigits(form.rg);
  const cep = onlyDigits(form.cep);
  return {
    nome: validateName(form.nome),
    cpf: isValidCpf(cpf) ? "" : "Informe um CPF válido com 11 dígitos",
    rg: rg && rg.length <= 20 ? "" : "Informe o RG somente com números",
    logradouro:
      required(form.logradouro, "o logradouro") ||
      (form.logradouro.trim().length > 200 ? "Máximo de 200 caracteres" : ""),
    numero: required(form.numero, "o número") || (form.numero.trim().length > 10 ? "Máximo de 10 caracteres" : ""),
    bairro: required(form.bairro, "o bairro") || (form.bairro.trim().length > 100 ? "Máximo de 100 caracteres" : ""),
    cidade: required(form.cidade, "a cidade") || (form.cidade.trim().length > 100 ? "Máximo de 100 caracteres" : ""),
    estado: UFS.has(form.estado.trim().toUpperCase()) ? "" : "Informe uma UF válida",
    cep: cep.length === 8 ? "" : "Informe o CEP com 8 dígitos",
    email: validateEmail(form.email),
    senha: validatePassword(form.senha),
    matricula:
      required(form.matricula, "a matrícula") || (form.matricula.trim().length > 100 ? "Máximo de 100 caracteres" : ""),
    passwordConfirmation: validatePasswordConfirmation(form.senha, form.passwordConfirmation),
  };
}

export default function SignupForm() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>(EMPTY_ERRORS);
  const { isLoading, error, successMessage, execute, clearMessages } = useAccountAccessAction();
  const update = useCallback(
    (field: keyof FormState, value: string) => {
      setForm((current) => ({ ...current, [field]: value }));
      if (errors[field]) setErrors((current) => ({ ...current, [field]: "" }));
      if (error || successMessage) clearMessages();
    },
    [clearMessages, error, errors, successMessage],
  );

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;
    const nextErrors = validate(form);
    setErrors(nextErrors);
    clearMessages();
    if (Object.values(nextErrors).some(Boolean)) return;
    const { passwordConfirmation: _passwordConfirmation, ...registration } = form;
    await execute(
      () =>
        accountAccessService.register({
          ...registration,
          cpf: onlyDigits(registration.cpf),
          rg: onlyDigits(registration.rg),
          cep: onlyDigits(registration.cep),
          nome: registration.nome.trim(),
          logradouro: registration.logradouro.trim(),
          numero: registration.numero.trim(),
          bairro: registration.bairro.trim(),
          cidade: registration.cidade.trim(),
          estado: registration.estado.trim().toUpperCase(),
          email: registration.email.trim().toLowerCase(),
          matricula: registration.matricula.trim(),
        }),
      "Cadastro realizado com sucesso. Você já pode entrar no sistema.",
    );
  };

  const fields: Array<{ key: keyof FormState; label: string; type?: string; autoComplete?: string }> = [
    { key: "nome", label: "Nome completo", autoComplete: "name" },
    { key: "cpf", label: "CPF", autoComplete: "off" },
    { key: "rg", label: "RG", autoComplete: "off" },
    { key: "matricula", label: "Matrícula", autoComplete: "off" },
    { key: "email", label: "E-mail", type: "email", autoComplete: "email" },
    { key: "logradouro", label: "Logradouro", autoComplete: "street-address" },
    { key: "numero", label: "Número", autoComplete: "address-line2" },
    { key: "bairro", label: "Bairro", autoComplete: "address-line3" },
    { key: "cidade", label: "Cidade", autoComplete: "address-level2" },
    { key: "estado", label: "Estado (UF)", autoComplete: "address-level1" },
    { key: "cep", label: "CEP", autoComplete: "postal-code" },
    { key: "senha", label: "Senha", type: "password", autoComplete: "new-password" },
    { key: "passwordConfirmation", label: "Confirmar senha", type: "password", autoComplete: "new-password" },
  ];

  return (
    <main className="min-h-screen bg-[var(--surface-page)] px-4 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-3xl rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-6 shadow-[var(--shadow-sm)] sm:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[var(--foreground)]">Criar conta</h1>
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">
            Preencha seus dados para criar um acesso de visitante.
          </p>
        </div>
        <form onSubmit={submit} noValidate aria-busy={isLoading} className="space-y-5">
          {error && (
            <div className="civitas-error-banner px-3 py-2.5 text-sm" role="alert">
              {error}
            </div>
          )}
          {successMessage && (
            <div
              className="rounded-sm border border-[var(--tone-success-border)] bg-[var(--tone-success-bg)] px-3 py-2.5 text-sm text-[var(--tone-success-text)]"
              role="status"
            >
              {successMessage}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map(({ key, label, type, autoComplete }) => (
              <Input
                key={key}
                id={`signup-${key}`}
                type={type}
                label={label}
                value={form[key]}
                onChange={(event) => update(key, event.target.value)}
                disabled={isLoading}
                autoComplete={autoComplete}
                required
                aria-invalid={Boolean(errors[key])}
                error={errors[key]}
              />
            ))}
          </div>
          <Button type="submit" variant="login" disabled={isLoading} className="max-w-none">
            {isLoading ? "Cadastrando..." : "Criar conta"}
          </Button>
        </form>
        <p className="mt-6 text-center">
          <Link href="/login" className="text-sm font-semibold text-[var(--secundary-1)] underline underline-offset-2">
            Já tem conta? Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}

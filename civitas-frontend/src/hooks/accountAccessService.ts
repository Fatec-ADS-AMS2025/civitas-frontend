const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5210/api").replace(/\/+$/, "");

export type PasswordRecoveryInput = { email: string };
export type PasswordResetInput = { token: string; password: string };
export type RegistrationInput = {
  nome: string;
  cpf: string;
  rg: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  email: string;
  senha: string;
  matricula: string;
};

type ApiEnvelope = { code?: number; message?: string; data?: unknown };

const RESET_LINK_INVALID_MESSAGE = "Link de redefinição inválido ou expirado.";
const REGISTRATION_CONFLICT_MESSAGES: Record<string, string> = {
  cpf: "Já existe um usuário cadastrado com este CPF.",
  email: "Já existe um usuário cadastrado com este e-mail.",
  matricula: "Já existe um usuário cadastrado com esta matrícula.",
};

export class AccountAccessApiError extends Error {
  readonly status: number;
  readonly code?: number;

  constructor(message: string, status: number, code?: number) {
    super(message);
    this.name = "AccountAccessApiError";
    this.status = status;
    this.code = code;
  }
}

export class InvalidPasswordResetTokenError extends AccountAccessApiError {
  constructor() {
    super(RESET_LINK_INVALID_MESSAGE, 400, 2);
    this.name = "InvalidPasswordResetTokenError";
  }
}

const getConflictField = (data: unknown): string | undefined => {
  if (typeof data === "string") return data;
  if (Array.isArray(data) && data.length === 1 && typeof data[0] === "string") return data[0];
  return undefined;
};

const parseError = async (response: Response): Promise<AccountAccessApiError> => {
  try {
    const body = (await response.json()) as ApiEnvelope;
    const conflictMessage =
      response.status === 409 ? REGISTRATION_CONFLICT_MESSAGES[getConflictField(body.data) ?? ""] : undefined;
    if (conflictMessage) return new AccountAccessApiError(conflictMessage, response.status, body.code);

    const details = Array.isArray(body.data)
      ? body.data.filter((item): item is string => typeof item === "string")
      : [];
    const message = details.length
      ? `${body.message ?? "Dados inválidos"}: ${details.join(" | ")}`
      : (body.message ?? "Não foi possível concluir a solicitação.");
    return new AccountAccessApiError(message, response.status, body.code);
  } catch {
    return new AccountAccessApiError("Não foi possível concluir a solicitação.", response.status);
  }
};

export class AccountAccessService {
  private async post(path: string, payload: unknown): Promise<void> {
    let response: Response;
    try {
      response = await fetch(`${API_URL}/auth/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      throw new AccountAccessApiError("Não foi possível comunicar com o servidor. Tente novamente em instantes.", 0);
    }

    if (!response.ok) throw await parseError(response);
  }

  requestPasswordRecovery(input: PasswordRecoveryInput): Promise<void> {
    return this.post("forgot-password", { email: input.email });
  }

  async resetPassword(input: PasswordResetInput): Promise<void> {
    try {
      await this.post("reset-password", { token: input.token, senha: input.password });
    } catch (error) {
      if (
        error instanceof AccountAccessApiError &&
        error.status === 400 &&
        error.code === 2 &&
        error.message === RESET_LINK_INVALID_MESSAGE
      ) {
        throw new InvalidPasswordResetTokenError();
      }

      throw error;
    }
  }

  register(input: RegistrationInput): Promise<void> {
    return this.post("register", input);
  }
}

export const accountAccessService = new AccountAccessService();

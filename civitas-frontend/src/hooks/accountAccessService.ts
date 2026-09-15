/**
 * Os fluxos publicos de acesso dependem de contratos especificos da API.
 * Em 15/09/2026, a API so expoe login publicamente: /api/email e
 * /api/usuarios exigem autenticacao, e nao ha endpoints de cadastro,
 * recuperacao ou redefinicao de senha. Por isso, este service nao tenta
 * adivinhar URL, payload ou formato de token.
 */

export type PasswordRecoveryInput = {
  email: string;
};

export type PasswordResetInput = {
  token: string;
  password: string;
};

export type RegistrationInput = {
  name: string;
  email: string;
  password: string;
};

export const ACCOUNT_ACCESS_BACKEND_UNAVAILABLE_MESSAGE =
  "Este recurso ainda nao esta disponivel. A API precisa disponibilizar um endpoint publico especifico para concluir esta solicitacao.";

export class AccountAccessBackendUnavailableError extends Error {
  constructor() {
    super(ACCOUNT_ACCESS_BACKEND_UNAVAILABLE_MESSAGE);
    this.name = "AccountAccessBackendUnavailableError";
  }
}

export class AccountAccessService {
  async requestPasswordRecovery(input: PasswordRecoveryInput): Promise<void> {
    void input;
    throw new AccountAccessBackendUnavailableError();
  }

  async resetPassword(input: PasswordResetInput): Promise<void> {
    void input;
    throw new AccountAccessBackendUnavailableError();
  }

  async register(input: RegistrationInput): Promise<void> {
    void input;
    throw new AccountAccessBackendUnavailableError();
  }
}

export const accountAccessService = new AccountAccessService();

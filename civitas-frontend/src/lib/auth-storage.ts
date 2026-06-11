export const AUTH_STORAGE_KEY = 'civitas.auth.user';
export const AUTH_CREDENTIALS_STORAGE_KEY = 'civitas.auth.credentials';

export type AuthStorageUser = {
  id: number;
  nome: string;
  email?: string;
  token: string;
  expiresAtUtc: string;
  tipoUsuario?: string | number;
};

export type AuthStoredCredentials = {
  email: string;
  password: string;
};

const isBrowser = () => typeof window !== 'undefined';

const isExpired = (expiresAtUtc: string): boolean => {
  const expiresAt = new Date(expiresAtUtc).getTime();
  return Number.isNaN(expiresAt) || expiresAt <= Date.now();
};

export const authStorage = {
  get(): AuthStorageUser | null {
    if (!isBrowser()) return null;

    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw) as Partial<AuthStorageUser> | null;
      if (
        !parsed ||
        typeof parsed.id !== 'number' ||
        typeof parsed.nome !== 'string' ||
        typeof parsed.token !== 'string' ||
        parsed.token.trim() === '' ||
        typeof parsed.expiresAtUtc !== 'string'
      ) {
        console.warn('[authStorage] Dados invalidos encontrados no localStorage. Limpando registro.');
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
      }

      if (isExpired(parsed.expiresAtUtc)) {
        console.warn('[authStorage] Sessao expirada encontrada no localStorage. Limpando registro.');
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
      }

      return {
        id: parsed.id,
        nome: parsed.nome,
        email: typeof parsed.email === 'string' ? parsed.email : undefined,
        token: parsed.token,
        expiresAtUtc: parsed.expiresAtUtc,
        tipoUsuario:
          typeof parsed.tipoUsuario === 'string' || typeof parsed.tipoUsuario === 'number'
            ? parsed.tipoUsuario
            : undefined,
      };
    } catch (error) {
      console.error('[authStorage] Falha ao ler usuario salvo no localStorage.', error);
      return null;
    }
  },

  set(user: AuthStorageUser) {
    if (!isBrowser()) return;
    try {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('[authStorage] Falha ao salvar usuario no localStorage.', error);
      throw error;
    }
  },

  clear() {
    if (!isBrowser()) return;
    try {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error('[authStorage] Falha ao remover usuario do localStorage.', error);
    }
  },
};

export const credentialsStorage = {
  get(): AuthStoredCredentials | null {
    if (!isBrowser()) return null;

    try {
      const raw = window.localStorage.getItem(AUTH_CREDENTIALS_STORAGE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw) as Partial<AuthStoredCredentials> | null;
      if (
        !parsed ||
        typeof parsed.email !== 'string' ||
        parsed.email.trim() === '' ||
        typeof parsed.password !== 'string' ||
        parsed.password.trim() === ''
      ) {
        console.warn('[credentialsStorage] Dados invalidos encontrados no localStorage. Limpando registro.');
        window.localStorage.removeItem(AUTH_CREDENTIALS_STORAGE_KEY);
        return null;
      }

      return {
        email: parsed.email.trim(),
        password: parsed.password,
      };
    } catch (error) {
      console.error('[credentialsStorage] Falha ao ler credenciais salvas no localStorage.', error);
      return null;
    }
  },

  set(credentials: AuthStoredCredentials) {
    if (!isBrowser()) return;
    try {
      window.localStorage.setItem(AUTH_CREDENTIALS_STORAGE_KEY, JSON.stringify(credentials));
    } catch (error) {
      console.error('[credentialsStorage] Falha ao salvar credenciais no localStorage.', error);
      throw error;
    }
  },

  clear() {
    if (!isBrowser()) return;
    try {
      window.localStorage.removeItem(AUTH_CREDENTIALS_STORAGE_KEY);
    } catch (error) {
      console.error('[credentialsStorage] Falha ao remover credenciais do localStorage.', error);
    }
  },
};

export const AUTH_STORAGE_KEY = 'civitas.auth.user';

export type AuthStorageUser = {
  id: number;
  nome: string;
};

const isBrowser = () => typeof window !== 'undefined';

export const authStorage = {
  get(): AuthStorageUser | null {
    if (!isBrowser()) return null;

    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw) as Partial<AuthStorageUser> | null;
      if (!parsed || typeof parsed.id !== 'number' || typeof parsed.nome !== 'string') {
        console.warn('[authStorage] Dados invalidos encontrados no localStorage. Limpando registro.');
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
      }

      return { id: parsed.id, nome: parsed.nome };
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

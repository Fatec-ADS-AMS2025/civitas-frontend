import { GenericService } from "./generic";
import UsuarioDTO from "@/models/usuario";

export class UsuarioService extends GenericService<UsuarioDTO> {
  constructor() {
    super("usuarios");
  }

  async getByCpf(cpf: string): Promise<UsuarioDTO | null> {
    try {
      const response = await fetch(`${this.getUrlEndpoint()}/cpf?cpf=${encodeURIComponent(cpf)}`);
      const payload = await this.handleResponse<UsuarioDTO[] | { data: UsuarioDTO[] | null }>(response);

      if (payload && typeof payload === "object" && "data" in payload) {
        const users = payload.data;
        return Array.isArray(users) ? users[0] ?? null : null;
      }

      return Array.isArray(payload) ? payload[0] ?? null : null;
    } catch (error) {
      console.error("Erro ao buscar usuario por CPF:", error);
      return null;
    }
  }

  async authenticate(email: string, password: string): Promise<UsuarioDTO | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    try {
      const users = await this.getAllData({ page: 1, size: 500 });
      const matchedUser = users.find((user) => {
        const userEmail = String(user.email ?? "").trim().toLowerCase();
        const userPassword = String(user.senha ?? "");
        return userEmail === normalizedEmail && userPassword === normalizedPassword;
      });

      return matchedUser ?? null;
    } catch (error) {
      console.error("Erro ao autenticar usuario:", error);
      return null;
    }
  }
}

export const usuarioService = new UsuarioService();

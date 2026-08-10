import type { InstituicaoGastosDTO } from "@/models/financeiro";
import type InstituicaoDTO from "@/models/instituicao";
import { GenericService } from "./generic";

export class InstituicaoService extends GenericService<InstituicaoDTO> {
  constructor() {
    super("instituicoes");
  }

  async getByName(name: string): Promise<InstituicaoDTO[]> {
    try {
      const response = await fetch(`${this.getUrlEndpoint()}/nome?name=${encodeURIComponent(name)}`);
      const payload = await this.handleResponse<InstituicaoDTO[] | { data: InstituicaoDTO[] | null }>(response);

      if (payload && typeof payload === "object" && "data" in payload) {
        return Array.isArray(payload.data) ? payload.data : [];
      }

      return Array.isArray(payload) ? payload : [];
    } catch (error) {
      console.error("Erro ao buscar instituicoes por nome:", error);
      return [];
    }
  }

  async getGastos(id: number): Promise<InstituicaoGastosDTO | null> {
    try {
      const response = await fetch(`${this.getUrlEndpoint()}/${id}/gastos`, {
        headers: this.createHeaders(),
      });
      const payload = await this.handleResponse(response, { showErrorToast: false });
      return this.unwrapItem<InstituicaoGastosDTO>(payload);
    } catch (error) {
      console.error(`Erro ao buscar gastos da instituicao ${id}:`, error);
      return null;
    }
  }
}

export const instituicaoService = new InstituicaoService();

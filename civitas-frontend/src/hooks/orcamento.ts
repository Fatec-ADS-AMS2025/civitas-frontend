import { GenericService } from "./generic";
import OrcamentoDTO from "@/models/orcamento";
import { filterActiveRecords } from "@/global/softDelete";

export class OrcamentoService extends GenericService<OrcamentoDTO> {
  constructor() {
    super('orcamentos');
  }

  async getByFilters(filters?: {
    page?: number;
    size?: number;
  }): Promise<OrcamentoDTO[]> {
    return filterActiveRecords(await this.getAllData(filters));
  }

  override async delete(id: number): Promise<void> {
    const response = await fetch(`${this.getUrlEndpoint()}/${id}/status-exclusao`, {
      method: "PATCH",
      headers: this.createHeaders(),
    });

    await this.handleResponse(response, { showSuccessToast: true });
  }
}

export const orcamentoService = new OrcamentoService();

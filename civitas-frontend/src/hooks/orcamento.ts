import { GenericService } from "./generic";
import OrcamentoDTO from "@/models/orcamento";

export class OrcamentoService extends GenericService<OrcamentoDTO> {
  constructor() {
    super('orcamentos');
  }

  async getByFilters(filters?: {
    page?: number;
    size?: number;
  }): Promise<OrcamentoDTO[]> {
    return this.getAllData(filters);
  }
}

export const orcamentoService = new OrcamentoService();

import { GenericService } from "./generic";
import OrcamentoDTO from "@/models/orcamento";

export class OrcamentoService extends GenericService<OrcamentoDTO> {
  constructor() {
    super("orcamentos");
  }
}

export const orcamentoService = new OrcamentoService();

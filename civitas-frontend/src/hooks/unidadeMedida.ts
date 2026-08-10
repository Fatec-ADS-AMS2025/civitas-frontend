import type UnidadeMedidaDTO from "@/models/unidadeMedida";
import { GenericService } from "./generic";

export class UnidadeMedidaService extends GenericService<UnidadeMedidaDTO> {
  constructor() {
    super("unidade-medida");
  }
}

export const unidadeMedidaService = new UnidadeMedidaService();

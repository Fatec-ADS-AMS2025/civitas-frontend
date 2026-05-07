import { GenericService } from "./generic";
import type UnidadeConsumidoraDTO from "@/models/unidadeConsumidora";

export class UnidadeConsumidoraService extends GenericService<UnidadeConsumidoraDTO> {
  constructor() {
    super("unidades-consumidoras");
  }
}

export const unidadeConsumidoraService = new UnidadeConsumidoraService();
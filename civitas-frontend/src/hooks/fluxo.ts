import type FluxoDTO from "@/models/fluxo";
import { GenericService } from "./generic";

export class FluxoService extends GenericService<FluxoDTO> {
  constructor() {
    super("fluxos");
  }
}

export const fluxoService = new FluxoService();

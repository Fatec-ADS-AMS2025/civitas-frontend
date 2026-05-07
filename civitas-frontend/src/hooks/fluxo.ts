import { GenericService } from "./generic";
import FluxoDTO from "@/models/fluxo";

export class FluxoService extends GenericService<FluxoDTO> {
  constructor() {
    super("fluxos");
  }
}

export const fluxoService = new FluxoService();

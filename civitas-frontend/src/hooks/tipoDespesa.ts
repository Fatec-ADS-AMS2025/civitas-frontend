import type TipoDespesaDTO from "@/models/tipoDespesa";
import { GenericService } from "./generic";

export class TipoDespesaService extends GenericService<TipoDespesaDTO> {
  constructor() {
    super("tipo-despesa");
  }
}

export const tipoDespesaService = new TipoDespesaService();

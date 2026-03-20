import { GenericService } from "./generic";
import TipoDespesaDTO from "@/models/tipoDespesa";

export class TipoDespesaService extends GenericService<TipoDespesaDTO> {
  constructor() {
    super("tipo-despesa");
  }
}

export const tipoDespesaService = new TipoDespesaService();

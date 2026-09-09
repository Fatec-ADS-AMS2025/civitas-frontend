import type FornecedorDTO from "@/models/fornecedor";
import { GenericService } from "./generic";

export class FornecedorService extends GenericService<FornecedorDTO> {
  constructor() {
    super("fornecedores");
  }
}

// Instância única do service para uso na aplicação
export const fornecedorService = new FornecedorService();

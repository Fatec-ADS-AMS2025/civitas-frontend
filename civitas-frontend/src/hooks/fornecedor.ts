import { GenericService } from './generic';
import FornecedorDTO from '@/models/fornecedor';

export class FornecedorService extends GenericService<FornecedorDTO> {
  constructor() {
    super('fornecedores');
  }
}

// Instância única do service para uso na aplicação
export const fornecedorService = new FornecedorService();
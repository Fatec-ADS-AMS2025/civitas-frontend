import { GenericService } from './generic';
import FornecedorDTO from '@/models/fornecedor';

export class FornecedorService extends GenericService<FornecedorDTO> {
  constructor() {
    super('fornecedor');
  }
}

// Instância única do service para uso na aplicação
export const fornecedorService = new FornecedorService();
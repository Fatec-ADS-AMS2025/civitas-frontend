import { GenericService } from "./generic";
import TipoInstituicaoDTO from "@/models/tipoInstituicao";

export class TipoInstituicaoService extends GenericService<TipoInstituicaoDTO> {
  constructor() {
    super("tipo-instituicao");
  }
}

export const tipoInstituicaoService = new TipoInstituicaoService();

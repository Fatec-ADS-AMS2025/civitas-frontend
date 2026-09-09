import type TipoInstituicaoDTO from "@/models/tipoInstituicao";
import { GenericService } from "./generic";

export class TipoInstituicaoService extends GenericService<TipoInstituicaoDTO> {
  constructor() {
    super("tipo-instituicao");
  }
}

export const tipoInstituicaoService = new TipoInstituicaoService();

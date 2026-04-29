import { GenericService } from "./generic";
import TipoCodigoDTO from "@/models/tipoCodigo";

export class TipoCodigoService extends GenericService<TipoCodigoDTO> {
  constructor() {
    super("tipo-codigo");
  }
}

export const tipoCodigoService = new TipoCodigoService();

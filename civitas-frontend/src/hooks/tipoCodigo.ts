import { GenericService, type ListQuery, type ResponseEnvelope } from "./generic";
import TipoCodigoDTO from "@/models/tipoCodigo";

const TIPO_CODIGO_ENDPOINT = "tipo-codigo";

const TIPO_CODIGO_UNSUPPORTED_MESSAGE =
  "O backend atual nao expoe o recurso de tipo de codigo. O dashboard segue funcionando sem esse lookup e a configuracao especifica desse cadastro fica indisponivel ate que a API seja implementada.";

const isMissingTipoCodigoEndpoint = (error: unknown): boolean => {
  return error instanceof Error && error.message.includes("HTTP 404");
};

const logOptionalTipoCodigoFallback = (error: unknown): void => {
  if (process.env.NODE_ENV === "development") {
    console.warn(
      `Lookup opcional ignorado para /api/${TIPO_CODIGO_ENDPOINT} porque o endpoint nao existe no backend atual.`,
      error
    );
  }
};

export class TipoCodigoService extends GenericService<TipoCodigoDTO> {
  constructor() {
    super(TIPO_CODIGO_ENDPOINT);
  }

  private toUnsupportedResourceError(): Error {
    return new Error(TIPO_CODIGO_UNSUPPORTED_MESSAGE);
  }

  async getAll(query?: ListQuery): Promise<TipoCodigoDTO[]> {
    try {
      return await this.requestCollection(query, { showErrorToast: false });
    } catch (error) {
      if (isMissingTipoCodigoEndpoint(error)) {
        throw this.toUnsupportedResourceError();
      }

      throw error;
    }
  }

  async getAllOptional(query?: ListQuery): Promise<TipoCodigoDTO[]> {
    try {
      return await this.requestCollection(query, { showErrorToast: false });
    } catch (error) {
      if (isMissingTipoCodigoEndpoint(error)) {
        logOptionalTipoCodigoFallback(error);
        return [];
      }

      throw error;
    }
  }

  async getAllData(query?: ListQuery): Promise<TipoCodigoDTO[]> {
    return this.getAllOptional(query);
  }

  async createEnvelope(data: unknown): Promise<ResponseEnvelope<TipoCodigoDTO>> {
    try {
      const response = await fetch(this.getUrlEndpoint(), {
        method: "POST",
        headers: this.createHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(data),
      });

      const payload = await this.handleResponse(response, {
        showSuccessToast: true,
        showErrorToast: false,
      });
      const envelope = this.toEnvelope<unknown>(payload);

      return {
        ...envelope,
        data: this.unwrapItem<TipoCodigoDTO>(payload),
      };
    } catch (error) {
      if (isMissingTipoCodigoEndpoint(error)) {
        throw this.toUnsupportedResourceError();
      }

      throw error;
    }
  }

  async updateEnvelope(
    id: number,
    data: Partial<TipoCodigoDTO>
  ): Promise<ResponseEnvelope<TipoCodigoDTO>> {
    try {
      const response = await fetch(`${this.getUrlEndpoint()}/${id}`, {
        method: "PUT",
        headers: this.createHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(data),
      });

      const payload = await this.handleResponse(response, {
        showSuccessToast: true,
        showErrorToast: false,
      });
      const envelope = this.toEnvelope<unknown>(payload);

      return {
        ...envelope,
        data: this.unwrapItem<TipoCodigoDTO>(payload),
      };
    } catch (error) {
      if (isMissingTipoCodigoEndpoint(error)) {
        throw this.toUnsupportedResourceError();
      }

      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.getUrlEndpoint()}/${id}`, {
        method: "DELETE",
        headers: this.createHeaders(),
      });

      await this.handleResponse(response, {
        showSuccessToast: true,
        showErrorToast: false,
      });
    } catch (error) {
      if (isMissingTipoCodigoEndpoint(error)) {
        throw this.toUnsupportedResourceError();
      }

      throw error;
    }
  }
}

export const tipoCodigoService = new TipoCodigoService();

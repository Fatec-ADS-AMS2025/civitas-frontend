import { showToast } from "@/hooks/useToast";
import { filterActiveRecords } from "@/global/softDelete";
import { authStorage } from "@/lib/auth-storage";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5210/api";

export interface ResponseEnvelope<T> {
  code?: string | number;
  message?: string;
  data?: T | null;
}

export type ApiEnvelope<T> = ResponseEnvelope<T>;
export type ApiResponse<T> = ResponseEnvelope<T>;

export interface PaginatedResult<T> {
  items: T[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface ListQuery {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

interface HandleResponseOptions {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

const DEFAULT_LIST_QUERY: Required<Pick<ListQuery, "page" | "size">> = {
  page: 1,
  size: 100,
};

const isDevelopmentEnvironment = process.env.NODE_ENV === "development";

const logHandledFallback = (message: string, error: unknown): void => {
  if (isDevelopmentEnvironment) {
    console.warn(message, error);
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const isResponseEnvelope = <T>(value: unknown): value is ResponseEnvelope<T> => {
  return isRecord(value) && "data" in value;
};

const parseApiMessageFromErrorText = (errorText: string): string => {
  try {
    const parsed = JSON.parse(errorText) as ResponseEnvelope<unknown>;
    if (parsed?.message) return parsed.message;
  } catch {
    // Keep fallback behavior when body is not a JSON envelope.
  }

  return errorText;
};

const TECHNICAL_ERROR_KEYS = new Set([
  "stacktrace",
  "trace",
  "traceid",
  "exception",
  "innerexception",
  "source",
  "targetsite",
]);

const translateApiErrorMessage = (message: string, status: number): string => {
  const normalized = message
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (
    normalized.includes("nao e possivel excluir um orcamento que possui despesas vinculadas")
  ) {
    return "Nao e possivel excluir este orcamento porque existem despesas vinculadas.";
  }

  if (
    normalized.includes("orcamento") &&
    (normalized.includes("foreign key") ||
      normalized.includes("reference constraint") ||
      normalized.includes("violates foreign key constraint") ||
      normalized.includes("delete statement conflicted"))
  ) {
    return "Nao foi possivel excluir este orcamento porque ele possui registros vinculados.";
  }

  if (status === 404 && normalized.includes("orcamento")) {
    return "O orcamento informado nao foi encontrado.";
  }

  return message;
};

const extractValidationMessages = (payload: unknown): string[] => {
  if (Array.isArray(payload)) {
    return payload
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item.length > 0);
  }

  if (isRecord(payload)) {
    return Object.entries(payload)
      .flatMap((value) => {
        const [key, fieldValue] = value;

        if (TECHNICAL_ERROR_KEYS.has(key.toLowerCase())) {
          return [];
        }

        if (typeof fieldValue === "string") {
          return [fieldValue.trim()];
        }

        if (Array.isArray(fieldValue)) {
          return fieldValue
            .map((item) => (typeof item === "string" ? item.trim() : ""))
            .filter((item) => item.length > 0);
        }

        return [];
      })
      .filter((item) => item.length > 0);
  }

  return [];
};

const buildDetailedApiErrorMessage = (
  errorJson: ResponseEnvelope<unknown> | null,
  errorText: string,
  status: number
): string => {
  const validationMessages = extractValidationMessages(errorJson?.data).map((message) =>
    translateApiErrorMessage(message, status)
  );
  const primaryMessage =
    errorJson?.message?.trim() ||
    parseApiMessageFromErrorText(errorText).trim() ||
    `Erro na requisicao (${status})`;
  const translatedPrimaryMessage = translateApiErrorMessage(primaryMessage, status);

  if (validationMessages.length === 0) {
    return translatedPrimaryMessage;
  }

  return `${translatedPrimaryMessage}: ${Array.from(new Set(validationMessages)).join(" | ")}`;
};

const isPaginatedResult = <T>(value: unknown): value is PaginatedResult<T> => {
  return isRecord(value) && Array.isArray(value.items);
};

const isHttpNotFoundError = (error: unknown): boolean => {
  return error instanceof Error && error.message.includes("HTTP 404");
};

const toQueryString = (
  query: ListQuery | undefined,
  defaults: Required<Pick<ListQuery, "page" | "size">> = DEFAULT_LIST_QUERY
): string => {
  const params = new URLSearchParams();
  const mergedQuery = { ...defaults, ...query };

  Object.entries(mergedQuery).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.set(key, String(value));
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

export class GenericService<T> {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  protected getUrlEndpoint(): string {
    return `${BASE_URL}/${this.endpoint}`;
  }

  protected createHeaders(init?: HeadersInit): Headers {
    const headers = new Headers(init);
    const authenticatedUser = authStorage.get();

    if (authenticatedUser?.token) {
      headers.set("Authorization", `Bearer ${authenticatedUser.token}`);
    }

    return headers;
  }

  protected async handleResponse<R = unknown>(
    response: Response,
    options: HandleResponseOptions = {}
  ): Promise<R> {
    if (response.status === 204) return undefined as R;

    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      let errorText = "";
      let errorJson: any = null;

      try {
        if (contentType && contentType.includes("application/json")) {
          errorJson = await response.json();
        } else {
          errorText = await response.text();
        }
      } catch {
        errorText = "Erro ao processar resposta do servidor.";
      }

      const message = buildDetailedApiErrorMessage(
        errorJson,
        errorText,
        response.status
      );

      if (options.showErrorToast !== false) {
        showToast(message, "error");
      }

      throw new Error(`HTTP ${response.status}: ${message}`);
    }

    if (contentType && contentType.includes("application/json")) {
      const json = (await response.json()) as R;

      if (
        options.showSuccessToast &&
        isRecord(json) &&
        typeof json.message === "string" &&
        json.message.trim() !== ""
      ) {
        showToast(json.message, "success");
      }

      return json;
    }

    return (await response.text()) as R;
  }

  protected toEnvelope<R>(payload: unknown): ResponseEnvelope<R> {
    if (isResponseEnvelope<R>(payload)) {
      return payload;
    }

    return {
      data: payload as R,
    };
  }

  protected unwrapItem<R>(payload: unknown): R {
    if (isResponseEnvelope<R>(payload)) {
      return payload.data as R;
    }

    return payload as R;
  }

  protected unwrapCollection<R>(payload: unknown): R[] {
    const data = isResponseEnvelope<unknown>(payload) ? payload.data : payload;

    if (Array.isArray(data)) {
      return data as R[];
    }

    if (isPaginatedResult<R>(data)) {
      return data.items;
    }

    return [];
  }

  protected normalizePaginatedResult<R>(
    payload: unknown,
    query?: ListQuery
  ): PaginatedResult<R> {
    const data = isResponseEnvelope<unknown>(payload) ? payload.data : payload;
    const page = query?.page ?? DEFAULT_LIST_QUERY.page;
    const size = query?.size ?? DEFAULT_LIST_QUERY.size;

    if (isPaginatedResult<R>(data)) {
      return {
        ...data,
        items: filterActiveRecords(data.items),
      };
    }

    const items = filterActiveRecords(Array.isArray(data) ? (data as R[]) : []);
    const totalRecords = items.length;
    const totalPages = totalRecords === 0 ? 0 : Math.ceil(totalRecords / size);

    return {
      items,
      totalRecords,
      totalPages,
      currentPage: totalPages === 0 ? 1 : Math.min(page, totalPages),
      pageSize: size,
    };
  }

  protected extractData<R>(payload: unknown): R {
    if (isResponseEnvelope<R>(payload)) {
      return payload.data as R;
    }

    return payload as R;
  }

  protected async requestCollection(
    query?: ListQuery,
    options: HandleResponseOptions = {}
  ): Promise<T[]> {
    const response = await fetch(`${this.getUrlEndpoint()}${toQueryString(query)}`, {
      headers: this.createHeaders(),
    });

    const payload = await this.handleResponse(response, options);
    return filterActiveRecords(this.unwrapCollection<T>(payload));
  }

  protected async requestItem(
    id: number,
    options: HandleResponseOptions = {}
  ): Promise<T> {
    const response = await fetch(`${this.getUrlEndpoint()}/${id}`, {
      headers: this.createHeaders(),
    });

    const payload = await this.handleResponse(response, options);
    return this.unwrapItem<T>(payload);
  }

  async getAll(query?: ListQuery): Promise<T[]> {
    return this.requestCollection(query);
  }

  async getPage(query?: ListQuery): Promise<PaginatedResult<T>> {
    const response = await fetch(`${this.getUrlEndpoint()}${toQueryString(query)}`, {
      headers: this.createHeaders(),
    });
    const payload = await this.handleResponse(response);
    return this.normalizePaginatedResult<T>(payload, query);
  }

  async getAllEnvelope(query?: ListQuery): Promise<ResponseEnvelope<T[]>> {
    const response = await fetch(`${this.getUrlEndpoint()}${toQueryString(query)}`, {
      headers: this.createHeaders(),
    });
    const payload = await this.handleResponse(response);
    const envelope = this.toEnvelope<unknown>(payload);

    return {
      ...envelope,
      data: filterActiveRecords(this.unwrapCollection<T>(payload)),
    };
  }

  async getInactive(query?: ListQuery): Promise<T[]> {
    const response = await fetch(`${this.getUrlEndpoint()}/inativos${toQueryString(query)}`, {
      headers: this.createHeaders(),
    });
    const payload = await this.handleResponse(response, { showErrorToast: false });
    return this.unwrapCollection<T>(payload);
  }

  async getInactiveEnvelope(query?: ListQuery): Promise<ResponseEnvelope<T[]>> {
    const response = await fetch(`${this.getUrlEndpoint()}/inativos${toQueryString(query)}`, {
      headers: this.createHeaders(),
    });
    const payload = await this.handleResponse(response, { showErrorToast: false });
    const envelope = this.toEnvelope<unknown>(payload);
    const items = this.unwrapCollection<T>(payload);

    return {
      ...envelope,
      data: items,
    };
  }

  async getAllData(query?: ListQuery): Promise<T[]> {
    try {
      return await this.requestCollection(query, { showErrorToast: false });
    } catch (error) {
      logHandledFallback(`Erro ao listar ${this.endpoint}:`, error);
      return [];
    }
  }

  async getById(id: number): Promise<T> {
    return this.requestItem(id);
  }

  async getByIdData(id: number): Promise<T | null> {
    try {
      return await this.requestItem(id, { showErrorToast: false });
    } catch (error) {
      if (isHttpNotFoundError(error)) {
        return null;
      }

      logHandledFallback(`Erro ao buscar ${this.endpoint} por ID ${id}:`, error);
      return null;
    }
  }

  async create(data: unknown): Promise<T> {
    const response = await fetch(this.getUrlEndpoint(), {
      method: "POST",
      headers: this.createHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(data),
    });

    const payload = await this.handleResponse(response, { showSuccessToast: true });
    return this.unwrapItem<T>(payload);
  }

  async createEnvelope(data: unknown): Promise<ResponseEnvelope<T>> {
    const response = await fetch(this.getUrlEndpoint(), {
      method: "POST",
      headers: this.createHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(data),
    });

    const payload = await this.handleResponse(response, { showSuccessToast: true });
    const envelope = this.toEnvelope<unknown>(payload);

    return {
      ...envelope,
      data: this.unwrapItem<T>(payload),
    };
  }

  async createData(data: any): Promise<T> {
    try {
      const payload = await this.create(data);
      return this.extractData<T>(payload as unknown as T | ApiEnvelope<T> | ApiResponse<T>);
    } catch (error) {
      console.error(`Erro ao criar ${this.endpoint}:`, error);
      throw error;
    }
  }

  async update(id: number, data: Partial<T>): Promise<T> {
    const response = await fetch(`${this.getUrlEndpoint()}/${id}`, {
      method: "PUT",
      headers: this.createHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(data),
    });

    const payload = await this.handleResponse(response, { showSuccessToast: true });
    return this.unwrapItem<T>(payload);
  }

  async updateEnvelope(id: number, data: Partial<T>): Promise<ResponseEnvelope<T>> {
    const response = await fetch(`${this.getUrlEndpoint()}/${id}`, {
      method: "PUT",
      headers: this.createHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(data),
    });

    const payload = await this.handleResponse(response);
    const envelope = this.toEnvelope<unknown>(payload);

    return {
      ...envelope,
      data: this.unwrapItem<T>(payload),
    };
  }

  async updateData(id: number, data: Partial<T>): Promise<T> {
    try {
      const payload = await this.update(id, data);
      return this.extractData<T>(payload as unknown as T | ApiEnvelope<T> | ApiResponse<T>);
    } catch (error) {
      console.error(`Erro ao atualizar ${this.endpoint} com ID ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    const response = await fetch(`${this.getUrlEndpoint()}/${id}`, {
      method: "DELETE",
      headers: this.createHeaders(),
    });

    await this.handleResponse(response, { showSuccessToast: true });
  }

  async patch(id: number, data: Partial<T>): Promise<T> {
    const response = await fetch(`${this.getUrlEndpoint()}/${id}`, {
      method: "PATCH",
      headers: this.createHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(data),
    });

    const payload = await this.handleResponse(response, { showSuccessToast: true });
    return this.unwrapItem<T>(payload);
  }

  async patchData(id: number, data: Partial<T>): Promise<T> {
    try {
      const payload = await this.patch(id, data);
      return this.extractData<T>(payload as unknown as T | ApiEnvelope<T> | ApiResponse<T>);
    } catch (error) {
      console.error(`Erro ao atualizar parcialmente ${this.endpoint} com ID ${id}:`, error);
      throw error;
    }
  }

  async alterarSituacao(id: number): Promise<void> {
    const response = await fetch(`${this.getUrlEndpoint()}/situacao/${id}`, {
      method: "PATCH",
      headers: this.createHeaders(),
    });

    await this.handleResponse(response, { showSuccessToast: true });
  }

  async alterarSituacaoEnvelope(id: number): Promise<ResponseEnvelope<unknown>> {
    const response = await fetch(`${this.getUrlEndpoint()}/situacao/${id}`, {
      method: "PATCH",
      headers: this.createHeaders(),
    });

    const payload = await this.handleResponse(response, { showSuccessToast: true });
    return this.toEnvelope<unknown>(payload);
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5210/api";

export interface ResponseEnvelope<T> {
  code?: string;
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

export interface ApiErrorPayload {
  code?: string;
  message?: string;
  details?: unknown;
  status?: number;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor({
    message,
    status,
    code,
    details,
  }: {
    message: string;
    status: number;
    code?: string;
    details?: unknown;
  }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const DEFAULT_LIST_QUERY: Required<Pick<ListQuery, "page" | "size">> = {
  page: 1,
  size: 100,
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const isResponseEnvelope = <T>(value: unknown): value is ResponseEnvelope<T> => {
  return isRecord(value) && "data" in value;
};

const isPaginatedResult = <T>(value: unknown): value is PaginatedResult<T> => {
  return isRecord(value) && Array.isArray(value.items);
};

const toQueryString = (query?: ListQuery): string => {
  const params = new URLSearchParams();
  const mergedQuery = { ...DEFAULT_LIST_QUERY, ...query };

  Object.entries(mergedQuery).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.set(key, String(value));
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

const getDefaultErrorMessage = (status: number): string => {
  if (status === 400) return "Requisição inválida.";
  if (status === 401) return "Sessão inválida ou expirada.";
  if (status === 403) return "Você não tem permissão para esta ação.";
  if (status === 404) return "Registro não encontrado.";
  if (status === 409) return "Conflito de dados no servidor.";
  if (status === 422) return "Os dados enviados são inválidos.";
  if (status >= 500) return "Erro interno no servidor. Tente novamente.";
  return "Não foi possível concluir a operação.";
};

const normalizeErrorMessage = (payload: unknown, status: number): string => {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (isRecord(payload)) {
    if (typeof payload.message === "string" && payload.message.trim()) {
      return payload.message;
    }

    if (typeof payload.title === "string" && payload.title.trim()) {
      return payload.title;
    }

    if (Array.isArray(payload.errors) && payload.errors.length > 0) {
      return String(payload.errors[0]);
    }

    if (isRecord(payload.errors)) {
      const firstKey = Object.keys(payload.errors)[0];
      if (firstKey) {
        const firstValue = payload.errors[firstKey];
        if (Array.isArray(firstValue) && firstValue.length > 0) {
          return String(firstValue[0]);
        }
      }
    }
  }

  return getDefaultErrorMessage(status);
};

const parseResponseBody = async (response: Response): Promise<unknown> => {
  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    const text = await response.text();
    return text || null;
  } catch {
    return null;
  }
};

export const getUserFriendlyErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Ocorreu um erro inesperado. Tente novamente.";
};

export class GenericService<T> {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  protected getUrlEndpoint(): string {
    return `${BASE_URL}/${this.endpoint}`;
  }

  protected async request<R = unknown>(input: RequestInfo | URL, init?: RequestInit): Promise<R> {
    const response = await fetch(input, init);
    const payload = await parseResponseBody(response);

    if (!response.ok) {
      throw new ApiError({
        status: response.status,
        message: normalizeErrorMessage(payload, response.status),
        code: isRecord(payload) && typeof payload.code === "string" ? payload.code : undefined,
        details: payload,
      });
    }

    return payload as R;
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

  protected extractData<R>(payload: unknown): R {
    if (isResponseEnvelope<R>(payload)) {
      return payload.data as R;
    }

    return payload as R;
  }

  async getAll(query?: ListQuery): Promise<T[]> {
    const payload = await this.request(`${this.getUrlEndpoint()}${toQueryString(query)}`);
    return this.unwrapCollection<T>(payload);
  }

  async getAllData(query?: ListQuery): Promise<T[]> {
    try {
      return await this.getAll(query);
    } catch (error) {
      console.error(`Erro ao listar ${this.endpoint}:`, error);
      return [];
    }
  }

  async getById(id: number): Promise<T> {
    const payload = await this.request(`${this.getUrlEndpoint()}/${id}`);
    return this.unwrapItem<T>(payload);
  }

  async getByIdData(id: number): Promise<T | null> {
    try {
      return await this.getById(id);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }

      console.error(`Erro ao buscar ${this.endpoint} por ID ${id}:`, error);
      return null;
    }
  }

  async create(data: unknown): Promise<T> {
    const payload = await this.request(this.getUrlEndpoint(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    return this.unwrapItem<T>(payload);
  }

  async createData(data: unknown): Promise<T> {
    const payload = await this.create(data);
    return this.extractData<T>(payload);
  }

  async update(id: number, data: Partial<T>): Promise<T> {
    const payload = await this.request(`${this.getUrlEndpoint()}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    return this.unwrapItem<T>(payload);
  }

  async updateData(id: number, data: Partial<T>): Promise<T> {
    const payload = await this.update(id, data);
    return this.extractData<T>(payload);
  }

  async delete(id: number): Promise<void> {
    await this.request(`${this.getUrlEndpoint()}/${id}`, {
      method: "DELETE",
    });
  }

  async patch(id: number, data: Partial<T>): Promise<T> {
    const payload = await this.request(`${this.getUrlEndpoint()}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    return this.unwrapItem<T>(payload);
  }

  async patchData(id: number, data: Partial<T>): Promise<T> {
    const payload = await this.patch(id, data);
    return this.extractData<T>(payload);
  }

  async alterarSituacao(id: number): Promise<void> {
    await this.request(`${this.getUrlEndpoint()}/situacao/${id}`, {
      method: "PATCH",
    });
  }
}

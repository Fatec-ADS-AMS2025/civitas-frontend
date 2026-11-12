/**
 * URL base da API do backend, sem barra final.
 *
 * Configure com `NEXT_PUBLIC_API_URL` (ver `.env.example`). O fallback aponta para o
 * backend do `docker compose` (porta 8080). Rodando o backend com `dotnet run`, use
 * `NEXT_PUBLIC_API_URL=http://localhost:5210/api`.
 */
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api").replace(/\/+$/, "");

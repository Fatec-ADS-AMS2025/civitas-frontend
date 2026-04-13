# Frontend Architecture

## Purpose
This document describes the current frontend architecture implemented in the active `src/` tree of `civitas-frontend`. It is based on code that is present today, not on planned behavior.

## Runtime Shape
- The application uses Next.js App Router from `src/app`.
- `src/app/layout.tsx` is the root shell. It imports `src/app/globals.css`, loads Material Symbols from Google Fonts, mounts `AccessibilityMenu`, mounts `Toaster`, and wraps the page tree in `<main id="conteudo-principal">`.
- `src/app/page.tsx` currently renders `src/app/login/page.jsx` directly, so `/` behaves as the login entry.
- `src/app/dashboard/layout.tsx` is a separate dashboard shell. It mounts `src/components/Sidebar/sidebar.tsx`, resolves the current route title/breadcrumbs from `usePathname()`, and applies the main content width and padding constraints used by dashboard pages.

## UI Composition
- Shared UI primitives live in `src/components/`.
- CRUD-oriented pages mostly compose:
  - `src/components/Table/searchbar.tsx`
  - `src/components/Table/table.tsx`
  - `src/components/Form/form.tsx`
  - `src/components/modal.tsx`
  - `src/components/Input.tsx`
  - `src/components/PaginationControls.tsx`
  - `src/components/feedback-states.tsx`
- Loading placeholders are implemented in `src/components/skeleton.tsx`.
- Toast notifications are rendered by `src/components/Toaster.tsx` and triggered through `src/hooks/useToast.ts`.
- Accessibility controls are global through `src/components/AccessibilityMenu.tsx` and rely on classes defined in `src/app/globals.css`.

## Data Access Architecture
- HTTP access is centralized in `src/hooks/generic.ts`.
- `GenericService<T>` provides:
  - base URL resolution from `NEXT_PUBLIC_API_URL` with fallback to `http://localhost:5210/api`
  - response envelope handling through `ResponseEnvelope<T>`
  - support for simple arrays, single items, and paginated payloads with `items`
  - CRUD helpers plus `alterarSituacao()`
  - toast emission for API success and error messages
- Entity services extend `GenericService<T>` in `src/hooks/`:
  - `usuario.ts`
  - `instituicao.ts`
  - `secretaria.ts`
  - `fornecedor.ts`
  - `orcamento.ts`
  - `despesa.ts`
  - `tipoDespesa.ts`
  - `tipoInstituicao.ts`
  - `unidadeMedida.ts`
- Some services add endpoint-specific methods:
  - `UsuarioService.getByCpf()` in `src/hooks/usuario.ts`
  - `InstituicaoService.getByName()` in `src/hooks/instituicao.ts`
  - `DespesaService.getByFilters()` and `OrcamentoService.getByFilters()` as simple query wrappers

## State and Aggregation
- There is no active global store in the current `src/` tree.
- Most state is page-local with `useState`, `useEffect`, `useMemo`, and `useCallback`.
- Feature aggregation hooks are used where a screen needs cross-entity composition:
  - `src/hooks/useDespesasDashboard.ts` loads despesas, tipos de despesa, orcamentos, instituicoes, fornecedores, and usuarios; derives dashboard rows, filters, and summary totals.
  - `src/hooks/financeiro.ts` merges despesas and orcamentos into a financial transaction view and exposes create/update/delete orchestration for the financeiro page.
  - `src/hooks/useClientPagination.ts` handles client-side pagination for in-memory arrays.

## Domain Modeling
- DTOs and typed contracts live in `src/models/`.
- Reused UI/domain constants and payload normalization live in `src/global/`:
  - `src/global/formPayload.ts`
  - `src/global/situacao.ts`
- The model layer is used directly in pages and services rather than behind an additional repository or adapter layer.

## Route-Level Composition
- `src/app/login/page.jsx` is a client-side login form UI that currently navigates to `/dashboard` without calling a backend auth endpoint.
- `src/app/dashboard/page.tsx` is an operational summary page built on top of `useDespesasDashboard()`.
- CRUD list pages are implemented at:
  - `src/app/dashboard/usuarios/page.tsx`
  - `src/app/dashboard/instituicoes/page.tsx`
  - `src/app/dashboard/secretaria/page.tsx`
  - `src/app/dashboard/fornecedor/page.tsx`
  - `src/app/dashboard/orcamentos/page.tsx`
- `src/app/dashboard/despesas/page.tsx` is not built on the shared `Table` component. It uses a dedicated dashboard-style list and modal forms, backed by `useDespesasDashboard()`.
- `src/app/dashboard/financeiro/page.tsx` uses the dedicated module under `src/components/testefinanceiro/`.
- `src/app/dashboard/configuracoes/page.tsx` is a multi-entity maintenance screen for `tipoInstituicao`, `tipoDespesa`, and `unidadeMedida`.

## Styling and Layout Boundaries
- Global theme tokens, Inter font setup, high-contrast rules, skeleton classes, and the broad `rounded` override are defined in `src/app/globals.css`.
- Dashboard shell spacing is defined in `src/app/dashboard/layout.tsx`.
- The sidebar in `src/components/Sidebar/sidebar.tsx` is a structural element of the dashboard shell and should be treated as a sensitive shared component.

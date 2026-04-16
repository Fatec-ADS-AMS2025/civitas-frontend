# Frontend Conventions

## Purpose
This document captures conventions that are implemented in the current frontend codebase, including a few important exceptions.

## Language and Module Conventions
- The repository is TypeScript-first, but not TypeScript-only.
- `tsconfig.json` defines the `@/*` alias to `./src/*`.
- `strict` mode is enabled in `tsconfig.json`.
- `allowJs` is enabled, and `src/app/login/page.jsx` is the visible JavaScript exception in the app tree.
- Interactive pages and components use `"use client"` at file scope.

## Service Conventions
- Entity services in `src/hooks/` extend `GenericService<T>` from `src/hooks/generic.ts`.
- Standard endpoint naming is based on the constructor argument passed to `super()`, for example:
  - `super("usuarios")`
  - `super("instituicoes")`
  - `super("tipo-despesa")`
- The expected backend envelope is `ResponseEnvelope<T>` with `{ code?, message?, data? }`.
- List handling supports both:
  - direct arrays in `data`
  - paginated lists where `data.items` is present
- The shared service layer also exposes `getInactive()` and `alterarSituacao()`; multiple pages use status toggle instead of hard delete.

## Form Conventions
- Shared CRUD modal forms use `src/components/Form/form.tsx`.
- `Form` centralizes submission in the form element and calls `onConfirm()` from `onSubmit`.
- The shared form supports:
  - `create`, `edit`, `view`, and `delete` modes
  - generated field configs
  - select and textarea field types
  - multi-step form splitting when there are more than four visible fields
  - per-field validators
- Shared field configs usually hide primary key fields such as `id`, `idSecretaria`, `idFornecedor`, or `idOrcamento`.
- Pages commonly normalize outbound payloads before create/update through helpers in `src/global/formPayload.ts`.

## UI Reuse Conventions
- CRUD pages prefer shared components before custom UI:
  - `SearchBar`
  - `Table`
  - `Form`
  - `Modal`
  - `Input`
  - `PaginationControls`
- `src/components/Table/table.tsx` expects column definitions and derives status badges when column ids match `status`, `statusLabel`, `situacao`, or `situacaoLabel`.
- `src/components/Input.tsx` is the main shared text input primitive and carries label/error rendering.
- `src/components/feedback-states.tsx` is the shared loading/empty/error UI for list and content states.

## Search and Filtering Conventions
- Shared list filtering is implemented in memory through `src/components/Table/search-utils.ts`.
- `SearchFieldConfig` distinguishes `local: "principal"` and `local: "filtro"`.
- Global search checks only fields marked as `principal`.
- Advanced filters normalize text before comparison.
- Important current exception: `src/components/Table/searchbar.tsx` filters reactively through state/effects rather than through a semantic `<form>` submit flow.

## Data Normalization Conventions
- `src/global/formPayload.ts` centralizes common normalization rules:
  - digit-only sanitization for CNPJ, CEP, telefone, and numeroDocumento
  - uppercase UF normalization
  - date normalization to `YYYY-MM-DD`
  - numeric coercion through `toNumberOrUndefined`
- `src/global/situacao.ts` defines the shared active/inactive constants:
  - `SITUACAO_ATIVO = 1`
  - `SITUACAO_INATIVO = 2`

## Pagination Conventions
- Server-side page loading is used where pages call `getPage()` from `GenericService`, currently visible in:
  - `src/app/dashboard/usuarios/page.tsx`
  - `src/app/dashboard/fornecedor/page.tsx`
- Client-side pagination over an already loaded array is implemented by `src/hooks/useClientPagination.ts`, currently used by the dashboard recent-expenses section in `src/app/dashboard/page.tsx`.

## Styling Conventions
- Global font setup is Inter through `src/app/globals.css`.
- Global color tokens are defined in `src/app/globals.css` with names such as `--primary-1`, `--secundary-1`, and `--tertialy-2`.
- `src/app/globals.css` also applies a broad override for classes containing `rounded`.
- Many shared components use explicit Tailwind utility strings with Civitas-specific class hooks such as:
  - `civitas-input`
  - `civitas-table`
  - `civitas-state`
  - `civitas-searchbar`

## Naming Conventions
- DTO interfaces in `src/models/` use semantic Portuguese domain naming, for example `UsuarioDTO`, `InstituicaoDTO`, and `TipoDespesaDTO`.
- Pages often add local `Row` types that enrich DTOs with display-only labels such as `situacaoLabel`, `tipoUsuarioLabel`, or lookup labels.
- Existing naming is mixed-language: domain names remain mostly Portuguese while some infrastructure names are English.

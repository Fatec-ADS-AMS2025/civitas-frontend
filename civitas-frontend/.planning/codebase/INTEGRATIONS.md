# Frontend Integrations

## Purpose
This document lists integrations that are actually present in the current frontend codebase.

## Backend REST API

### Base URL
- `src/hooks/generic.ts` resolves the backend base URL as:
  - `process.env.NEXT_PUBLIC_API_URL`
  - fallback `http://localhost:5210/api`

### HTTP Client
- The active frontend uses native `fetch`.
- Request and response orchestration is centralized in `GenericService<T>` from `src/hooks/generic.ts`.
- Success and error feedback is propagated to the UI through `showToast()` from `src/hooks/useToast.ts`.

### Envelope and Pagination Handling
- The service layer expects `{ code?, message?, data? }`.
- List responses support:
  - `data` as a plain array
  - `data.items` as a paginated list
- `GenericService.getPage()` normalizes pagination into `PaginatedResult<T>`.

### Active Service-to-Endpoint Mapping
- `src/hooks/usuario.ts` -> `usuarios`
  - adds `getByCpf()`
- `src/hooks/instituicao.ts` -> `instituicoes`
  - adds `getByName()`
- `src/hooks/secretaria.ts` -> `secretarias`
- `src/hooks/fornecedor.ts` -> `fornecedores`
- `src/hooks/orcamento.ts` -> `orcamentos`
- `src/hooks/despesa.ts` -> `despesas`
- `src/hooks/tipoDespesa.ts` -> `tipo-despesa`
- `src/hooks/tipoInstituicao.ts` -> `tipo-instituicao`
- `src/hooks/unidadeMedida.ts` -> `unidade-medida`

## Frontend-to-Browser Integrations

### Routing
- Next.js client navigation is used through `useRouter()` and `usePathname()` in route shells and interactive pages.
- The dashboard shell and sidebar depend on these hooks for navigation and route-derived titles.

### Local Storage
- `src/components/AccessibilityMenu.tsx` persists:
  - `app-font-size`
  - `app-high-contrast`
- These values are applied on the client to control font size and contrast mode.

### Browser APIs
- `window.confirm()` is used in destructive flows, for example in:
  - `src/components/Table/table.tsx`
  - `src/app/dashboard/despesas/page.tsx`
- `window.addEventListener("keydown", ...)` is used in `src/components/Sidebar/sidebar.tsx` for numeric keyboard shortcuts.

## External UI Assets

### Google Fonts
- `src/app/layout.tsx` loads Material Symbols through:
  - `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined`
- `src/app/globals.css` imports Inter through Google Fonts.

### Public Assets
- Images used by the active UI come from `public/`, including:
  - `public/logo.png`
  - `public/logo1.png`
  - `public/mnote.png`
  - `public/imgsForm/*`

## Styling Toolchain
- `src/app/globals.css` imports Tailwind with `@import "tailwindcss"`.
- `postcss.config.mjs` configures `@tailwindcss/postcss`.

## Integrations Not Confirmed in Active Code
- `axios` is installed but no active usage was found in the current `src/` tree.
- `zustand` is installed but active usage was not found in the current `src/` tree; the only observed usage was inside the excluded `src/src/` tree.
- No authentication SDK, analytics SDK, form library, or client-side data-fetching framework was found in the active route tree.

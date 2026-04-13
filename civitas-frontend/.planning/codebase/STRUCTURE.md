# Frontend Structure

## Purpose
This document describes the current repository structure relevant to frontend maintenance.

## Top-Level Layout
```text
.
|- AGENTS.md
|- CLAUDE.md
|- CORRECOES_FRONTEND_RESUMO.md
|- docs/
|- next.config.ts
|- package.json
|- postcss.config.mjs
|- public/
|- src/
|- tsconfig.json
```

## Primary Source Directories

### `src/app`
- Next.js App Router entrypoint.
- Important files:
  - `src/app/layout.tsx`
  - `src/app/globals.css`
  - `src/app/page.tsx`
  - `src/app/login/page.jsx`
  - `src/app/dashboard/layout.tsx`
  - `src/app/dashboard/page.tsx`
  - `src/app/dashboard/usuarios/page.tsx`
  - `src/app/dashboard/instituicoes/page.tsx`
  - `src/app/dashboard/secretaria/page.tsx`
  - `src/app/dashboard/fornecedor/page.tsx`
  - `src/app/dashboard/orcamentos/page.tsx`
  - `src/app/dashboard/despesas/page.tsx`
  - `src/app/dashboard/financeiro/page.tsx`
  - `src/app/dashboard/configuracoes/page.tsx`

### `src/components`
- Shared UI and feature-level presentation components.
- Notable files and subfolders:
  - `src/components/Input.tsx`
  - `src/components/button.tsx`
  - `src/components/modal.tsx`
  - `src/components/Toaster.tsx`
  - `src/components/AccessibilityMenu.tsx`
  - `src/components/PaginationControls.tsx`
  - `src/components/feedback-states.tsx`
  - `src/components/skeleton.tsx`
  - `src/components/checkbox.tsx`
  - `src/components/Form/form.tsx`
  - `src/components/Sidebar/sidebar.tsx`
  - `src/components/Table/`
  - `src/components/testefinanceiro/`

### `src/hooks`
- Service layer and aggregation hooks.
- Structure:
  - entity services derived from `GenericService<T>`
  - UI support hooks such as `useToast.ts`
  - feature hooks such as `useDespesasDashboard.ts` and `financeiro.ts`
  - local pagination helper in `useClientPagination.ts`

### `src/models`
- DTO interfaces and typed contracts for backend-facing data.
- Covers usuarios, instituicoes, secretarias, fornecedores, despesas, orcamentos, tipos, unidade de medida, and financeiro payloads.

### `src/global`
- Shared normalization and constant utilities.
- Important files:
  - `src/global/formPayload.ts`
  - `src/global/situacao.ts`
  - `src/global/useLoading.js`

## Support Directories

### `public`
- Static assets used by the UI.
- Includes logo files, form illustrations, and simple image assets.

### `docs`
- Project-level operational and component notes.
- Relevant documents in the current snapshot include:
  - `docs/INPUT_COMPONENT.md`
  - `docs/PADRAO_FORMULARIOS_ENTER.md`

## Operational Files
- `AGENTS.md`
  - operational guidance for frontend maintenance and backend contract expectations
- `CLAUDE.md`
  - additional AI workflow instructions
- `CORRECOES_FRONTEND_RESUMO.md`
  - maintenance summary of previously applied fixes

## Known Non-Primary or Derived Areas

### `src/src`
- A duplicate source tree exists under `src/src/`.
- It is excluded by `tsconfig.json` and should not be treated as the primary active frontend source.

### `.next`
- Generated Next.js build output.
- Present in the repository snapshot but not a source-of-truth directory.

### `node_modules`
- Installed dependencies.
- Present in the repository snapshot but not a source-of-truth directory.

# Frontend Testing

## Purpose
This document records the current testing posture of the frontend repository.

## Current Automated Test Status
- No automated frontend test suite was found in the analyzed snapshot.
- No `*.test.*` files were found.
- No `*.spec.*` files were found.
- `package.json` does not define a `test` script.
- No Jest, Vitest, Playwright, Cypress, or Testing Library dependency was found in `package.json`.

## What Exists Instead
- The codebase contains UI support and demo-like components under `src/components/testefinanceiro/`, including:
  - `FinanceiroTestSuite.tsx`
  - `FinanceiroCrudTeste.tsx`
  - `FinanceiroFiltrosTeste.tsx`
- These are React components, not automated tests.
- They are not wired to a configured test runner.

## Validation Signals Present in the Repository
- `CORRECOES_FRONTEND_RESUMO.md` states that `npm run build` was validated successfully at the time that summary was written.
- `AGENTS.md` asks maintainers to manually validate:
  - typing
  - complete CRUD flows
  - filters and search
  - loading, error, and empty states

## Shared Components That Carry High Manual Verification Weight
- `src/components/Form/form.tsx`
- `src/components/Table/table.tsx`
- `src/components/Table/searchbar.tsx`
- `src/components/Input.tsx`
- `src/components/modal.tsx`
- `src/components/PaginationControls.tsx`
- `src/components/feedback-states.tsx`
- `src/components/Sidebar/sidebar.tsx`

## Recommended Interpretation for Future Work
- Assume UI behavior is primarily protected by manual checks and by the app build, not by automated regression coverage.
- Changes to shared CRUD primitives, dashboard hooks, or route shells should be treated as higher-risk because the repository does not currently provide automated safety nets.

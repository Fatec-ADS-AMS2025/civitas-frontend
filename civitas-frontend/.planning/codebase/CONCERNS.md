# Frontend Concerns

## Purpose
This document records maintenance risks and inconsistencies that are directly observable in the repository. It does not prescribe automatic refactors.

## Active Risks

### 1. Duplicated `src/src` tree exists but is excluded from TypeScript
- `tsconfig.json` excludes `src/src/**/*`.
- The repository still contains a parallel `src/src/` tree with hooks, components, and pages.
- That excluded tree contains code that differs from the active `src/` tree, including an older toast store based on Zustand in `src/src/hooks/toast.ts`.
- Risk: drift between active code and excluded legacy artifacts can confuse future maintenance and agent context generation.

### 2. `task:context` points to a missing script
- `package.json` defines `"task:context": "node scripts/fetch-github-task-context.mjs"`.
- No `scripts/` directory was found in the analyzed snapshot.
- Risk: operational instructions may reference tooling that is not available locally.

### 3. Mixed TypeScript and JavaScript in the app tree
- The project is mostly TypeScript, but `src/app/login/page.jsx` is still JSX.
- `tsconfig.json` enables `allowJs`.
- Risk: typing guarantees are inconsistent across the route tree, especially around the login flow.

### 4. Installed dependencies are not the dominant implementation path
- `axios` is installed in `package.json`, but no active usage was found in the current `src/` tree.
- `zustand` is installed in `package.json`, but its usage was only found in the excluded `src/src/` tree.
- Risk: package presence can imply architecture that does not actually apply to active code.

### 5. No automated test suite was found
- No `*.test.*` or `*.spec.*` files were found in the active project tree.
- `package.json` has no test script and no test runner dependency is configured.
- Risk: CRUD flows and shared component changes rely on manual verification and build-level confidence.

### 6. Documentation drift exists between docs and active code
- `docs/PADRAO_FORMULARIOS_ENTER.md` describes `src/components/Table/searchbar.tsx` as a semantic `<form>` with submit behavior.
- The current `src/components/Table/searchbar.tsx` does not render a `<form>` or a dedicated submit button; it filters reactively through state and effects.
- `docs/INPUT_COMPONENT.md` references an example route `/componentes`, but no such route exists under `src/app`.
- Risk: internal docs may be partially outdated and should not be treated as source of truth over code.

### 7. Some linked routes have no evidence in `src/app`
- `src/app/login/page.jsx` links to `/forgot-password` and `/signup`.
- `src/components/Sidebar/sidebar.tsx` pushes to `/perfil`.
- No matching route files were found under `src/app` for those paths.
- Risk: navigation can lead to unresolved routes unless those pages exist outside the analyzed snapshot.

### 8. Local filtering on paginated entity pages is page-scoped
- `src/app/dashboard/usuarios/page.tsx` and `src/app/dashboard/fornecedor/page.tsx` fetch one backend page at a time with `getPage()`.
- Their `SearchBar` usage filters the in-memory page data, not the entire backend dataset.
- Risk: users can interpret filters as global search even though the current implementation only filters the currently loaded page.

### 9. `src/global/useLoading.js` is unsafe and does not follow React hook rules
- The file calls `useState()` at module scope and exports the resulting values directly.
- No active imports of this file were found in the current `src/` tree.
- Risk: if reused later, it will break React rules-of-hooks expectations immediately.

### 10. Shared structural components contain side effects and mutable module state
- `src/components/Sidebar/sidebar.tsx` mutates the module-level `defaultItems` array to track active state.
- The same component logs the current pathname with `console.log()` inside an effect.
- Risk: mutable shared data and runtime logging inside a structural shell can complicate debugging and lead to non-obvious behavior.

### 11. Unreferenced or legacy UI artifacts remain in the active tree
- `src/components/Table/searchbar_Forne.tsx` and `src/components/Table/table_Forne.tsx` were not found in active imports.
- `src/components/testefinanceiro/FinanceiroTestSuite.tsx`, `FinanceiroCrudTeste.tsx`, and `FinanceiroFiltrosTeste.tsx` are components, not automated tests, and are not part of a configured test runner.
- Risk: naming and leftover files may suggest active flows that are not actually wired into the current routes.

## Non-Primary Artifacts
- `.next/` and `node_modules/` exist in the repository snapshot but are generated artifacts and should not be treated as primary architecture sources.

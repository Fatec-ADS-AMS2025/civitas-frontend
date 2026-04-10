# Frontend Stack

## Purpose
This document records the current technical stack visible in the repository.

## Core Framework and Runtime
- Next.js `15.5.4`
- React `19.1.0`
- React DOM `19.1.0`
- TypeScript `^5`

## Styling
- Tailwind CSS `^4`
- `@tailwindcss/postcss` `^4`
- Global styling entry at `src/app/globals.css`
- PostCSS config at `postcss.config.mjs`

## Build and Dev Workflow
- `package.json` scripts:
  - `npm run dev` -> `next dev --turbopack`
  - `npm run build` -> `next build --turbopack`
  - `npm run start` -> `next start`
- `next.config.ts` sets `turbopack.root = __dirname`.

## Language and Compilation Settings
- TypeScript configuration lives in `tsconfig.json`.
- Notable compiler options:
  - `strict: true`
  - `allowJs: true`
  - `moduleResolution: "bundler"`
  - `jsx: "preserve"`
  - `paths["@/*"] = ["./src/*"]`
- `src/src/**/*` is explicitly excluded.

## Networking
- Native `fetch` is the active HTTP mechanism.
- The request abstraction lives in `src/hooks/generic.ts`.

## State Management
- Active state management is React local state and custom hooks.
- `useTransition()` is used in `src/hooks/useClientPagination.ts`.
- Zustand is installed (`^5.0.8`) but no active store usage was found in the current `src/` tree.

## Installed but Non-Dominant Dependencies
- `axios` `^1.12.2`
  - installed in `package.json`
  - no active usage found in the current `src/` tree
- `zustand` `^5.0.8`
  - installed in `package.json`
  - observed only in the excluded legacy tree under `src/src/`

## UI and Asset Dependencies
- Inter and Material Symbols are loaded from Google Fonts.
- Static assets are served from `public/`.

## Testing Tooling
- No automated testing framework dependency was found in `package.json`.
- No test script is defined in `package.json`.

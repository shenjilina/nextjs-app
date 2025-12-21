# Project Rules

## Tech Stack

- Next.js App Router (`src/app`)
- React + TypeScript
- Tailwind CSS + Radix UI wrappers (`src/components/ui`)
- API Route Handlers (`src/app/api`)
- State: Zustand (`src/lib/stores`)
- Tests: Vitest (`src/tests`, `vitest.config.ts`)

## Directory Conventions

- Pages/layouts: `src/app/**`
- Shared UI components: `src/components/ui/**`
- Feature components: `src/app/**/components/**`
- Client hooks: `src/lib/hooks/**`
- Global stores: `src/lib/stores/**`
- i18n resources: `src/locales/{zh,en}.json`

## Naming Conventions

- Components: PascalCase
- Variables/functions: camelCase
- Constants: UPPER_SNAKE_CASE

## Code Quality

- Do not commit `debugger` statements.
- Avoid `console.log` in non-test code.
- Avoid `dangerouslySetInnerHTML` unless content is sanitized and trusted.
- Do not commit secrets (API keys, tokens).

## Commands

- Dev: `pnpm run dev`
- Lint: `pnpm run lint`
- Tests: `pnpm run test:run`

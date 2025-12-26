# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
pnpm dev          # Start development server (http://localhost:3000)

# Building
pnpm build        # Build for production (includes type checking)
pnpm start        # Start production server

# Code Quality
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix ESLint issues
pnpm format       # Format code with Prettier
pnpm format:check # Check formatting

# Testing
pnpm test         # Run tests in watch mode
pnpm test:run     # Run tests once
pnpm test:ui      # Run tests with UI
pnpm test:coverage # Run tests with coverage report
```

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode, noEmit)
- **UI**: React 19 + Tailwind CSS v4 + Radix UI + shadcn/ui
- **State Management**: Zustand
- **Authentication**: NextAuth v4
- **Testing**: Vitest with React Testing Library
- **Package Manager**: pnpm

## Architecture

### Directory Structure

```
/                          # Project root
├── app/                   # Next.js App Router
│   ├── api/v1/           # RESTful API routes
│   ├── chat/             # Chat feature pages
│   ├── login/            # Authentication pages
│   ├── layout.tsx        # Root layout
│   ├── providers.tsx     # Global providers (theme, i18n)
│   └── page.tsx          # Home page
├── components/           # Reusable components
│   ├── ui/              # Base UI components (shadcn/ui)
│   └── ai-elements/     # AI-related components
├── lib/                 # Business logic and utilities
│   ├── api/             # API response utilities
│   ├── hooks/           # Custom React hooks
│   ├── stores/          # Zustand stores
│   └── utils.ts         # Utility functions (cn helper)
├── locales/            # i18n language files (en.json, zh.json)
├── schemas/            # Zod validation schemas
├── types/              # TypeScript type definitions
└── tests/              # Test files
```

### Key Patterns

1. **Server-First Approach**:
   - Default to Server Components
   - Add `"use client"` only when necessary (hooks, events, state)
   - Place `"use client"` at the very top of files

2. **Path Aliases**:
   - Use `@/*` for all imports (points to project root)
   - Avoid deep relative imports like `../../../../`

3. **API Routes**:
   - Place in `app/api/v1/**/route.ts`
   - Export HTTP methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`
   - Use response helpers from `lib/api/response.ts`:

     ```typescript
     import { successResponse, badRequest, validationError } from "@/lib/api/response";

     // Success
     return successResponse(data, 200, "Optional message");

     // Errors
     return badRequest("Invalid input");
     return validationError(errors);
     ```

4. **State Management**:
   - Client state: Zustand stores in `lib/stores/`
   - Global providers: `app/providers.tsx`

5. **Validation**:
   - Use Zod schemas from `schemas/`
   - Prefer `safeParse()` for error handling

6. **Styling**:
   - Use `cn()` helper for Tailwind class merging
   - Tailwind CSS v4 with PostCSS

## Testing

- Test files: `tests/**/*.{test,spec}.{ts,tsx}`
- Configured with Vitest and JSDOM
- Run single test: `pnpm test -- filename.test.ts`
- Coverage excludes: `node_modules/`, `tests/`, config files

## Import Guidelines

```typescript
// Use import type for type-only imports
import type { User } from "@/types/users";

// Path aliases over relative paths
import { apiClient } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
```

## Code Quality Standards

Before committing changes, ensure:

1. `pnpm lint` passes
2. `pnpm format:check` passes
3. `pnpm test:run` passes
4. `pnpm build` succeeds (includes type checking)

## Internationalization

- Use `useI18n()` hook from `lib/i18n.tsx`
- Language files: `locales/en.json`, `locales/zh.json`
- Language preference stored in `localStorage` as `app-lang`

## Important Notes

- Never expose sensitive information (tokens, passwords) in logs or responses
- Follow Next.js App Router conventions for file-based routing
- Server Components are the default - opt-in to client components with `"use client"`
- All new API endpoints should follow the `/api/v1/` pattern

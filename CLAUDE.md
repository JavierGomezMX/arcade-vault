# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Arcade Vault ("arcade-vault") — plataforma para jugar online y competir por puntos. Currently a fresh `create-next-app` scaffold (App Router); no game features implemented yet.

## Commands

```bash
npm run dev     # start dev server (Next.js, Turbopack default)
npm run build   # production build
npm run start   # run production build
npm run lint    # ESLint (flat config, eslint-config-next core-web-vitals + typescript)
```

No test runner is configured yet.

## Critical: this Next.js is not the one you know

Per `AGENTS.md`: this project pins `next@16.2.10` / `react@19.2.4`, and this version has breaking changes vs. training-data knowledge of Next.js — APIs, conventions, and file structure may differ. **Before writing any Next.js code, read the relevant guide under `node_modules/next/dist/docs/`** (sections: `01-app`, `02-pages`, `03-architecture`, `04-community`) and heed deprecation notices there rather than assuming prior Next.js knowledge is current.

## Architecture

- App Router only, source root `src/app` (path alias `@/*` → `./src/*`).
- `src/app/layout.tsx` — root layout, loads `Geist`/`Geist_Mono` fonts via `next/font/google`.
- `src/app/page.tsx` — default landing page (unmodified CNA template).
- `next.config.ts` has `reactCompiler: true` — the React Compiler (babel-plugin-react-compiler) is active, so avoid manual memoization workarounds it's meant to replace.
- Styling: Tailwind CSS v4 via `@tailwindcss/postcss` (no `tailwind.config.*` — v4 uses CSS-based config in `globals.css`).

## Spec-driven workflow

Per `README.md`, this project follows spec-driven design using `/spec` and `/spec-impl`, based on conventions from https://github.com/Klerith/fernando-skills, installed via:

```bash
npx skills@latest add Klerith/fernando-skills
```

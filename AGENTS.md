# Repository Guidelines

## Project Structure & Module Organization

`src/` contains the application code. Use `src/api/` for backend client modules, `src/views/` for page-level Vue views, `src/components/` for reusable UI, `src/stores/` for Pinia state, `src/router/` for route definitions, and `src/utils/` for shared helpers. Global styles live in `src/theme/` and static assets in `src/assets/` or `public/`. Deployment files are under `docker/`, and CI workflows are in `.github/workflows/`.

## Build, Test, and Development Commands

Install dependencies with `npm install` (Node `>=18`, npm `>=8`).

- `npm run dev`: starts the Vite dev server with the configured proxy.
- `npm run build`: creates a production bundle in `dist/`.
- `npm run build:docker`: builds into `docker/dist/` for the container image.
- `npm run lint:eslint`: runs ESLint with `--fix` on `.ts` and `.vue` files in `src/`.
- `npm run prettier`: formats the repo with Prettier.

## Coding Style & Naming Conventions

This project uses TypeScript, Vue 3 SFCs, ESLint, and Prettier. Prettier is authoritative: tabs for indentation, single quotes, semicolons, trailing commas (`es5`), and LF line endings. Keep Vue view files in lowercase directories with `index.vue` entry points (for example, `src/views/admin/user/index.vue`). Use PascalCase for reusable component directories under `src/components/`, camelCase for utilities and store modules, and colocate i18n files as `en.ts` and `zh-cn.ts`.

## Testing Guidelines

There is no dedicated unit-test suite in this repository yet. The current quality gate is successful `npm run build`, plus linting and formatting before review. When changing routes, stores, or API integrations, verify the affected flow locally in `npm run dev`. If you add tests, place them near the feature or under a future `tests/` directory and name them `*.spec.ts`.

## Commit & Pull Request Guidelines

Recent history favors short, imperative commit messages, often with Conventional Commit prefixes such as `fix:` and `feat:`. Follow that style when possible, for example `fix: correct token expiry handling`. Keep dependency bumps and feature work in separate commits. PRs should include a concise description, linked issue or task, screenshots for UI changes, and notes about config or proxy changes. Ensure linting and production build pass before requesting review.

## Security & Configuration Tips

Environment settings are stored in `.env` and `.env.development`. Do not commit secrets. Validate proxy targets and public path settings before changing `vite.config.ts` or Docker assets.

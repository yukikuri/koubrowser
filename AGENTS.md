# AGENTS.md

## Project overview

This repository contains 甲ブラウザ, an Electron-based dedicated browser app for 艦隊これくしょん -艦これ-.

The app is built with:

- Electron / electron-vite
- Vue 3
- TypeScript
- Buefy / Bulma
- NeDB
- Highcharts
- Vitest
- electron-builder

Keep changes small and consistent with the existing code style.

## Important product policy

This app must not alter, inject, or interfere with communication to the 艦これ game servers.

The app may observe game-related communication for local display/recording features, but do not add behavior that changes requests, responses, game state, or server communication semantics.

Pay special attention when editing these areas:

- `src/main/kcbrowser.ts`
- `src/preload/xhr-hook.ts`
- `src/common/kcsapi_hook.ts`

## Package manager

Use npm.

Do not introduce pnpm, yarn, or another package manager unless explicitly requested.

## Common commands

Install dependencies:

```bash
npm install
```

Development:

```bash
npm run dev
```

Lint:

```bash
npm run lint
```

Type check:

```bash
npm run typecheck
```

Test:

```bash
npm run test
```

Coverage:

```bash
npm run test:coverage
```

Build:

```bash
npm run build
```

Windows installer build:

```bash
npm run build:win
```

## Validation rules

When changing TypeScript, Vue, Electron main/preload code, or shared logic, prefer running:

```bash
npm run typecheck
npm run test
```

Do not run `npm run lint` by default. The repository currently reports many existing lint errors, so running the full lint command is usually noisy and not useful for ordinary agent tasks.

Run `npm run lint` only when the task is specifically about lint cleanup, ESLint configuration, formatting, or style validation.

If the change is small and tests are not relevant, explain why tests were not run.

Do not run heavy release builds such as `npm run build:win` unless the task is specifically about packaging, installer generation, or release verification.

## Directory guide

- `src/main`: Electron main process, IPC, records, update check, workers
- `src/preload`: preload scripts and renderer bridge
- `src/renderer`: Vue renderer app
- `src/common`: shared types, calculations, and 艦これ API related logic
- `src/global`: shared global code
- `resources`: bundled resource data
- `openapi`: OpenAPI definitions
- `scripts`: helper scripts for licenses, development code, and update-check assets
- `test`: test-related files

## Generated files

Do not manually edit generated files unless explicitly requested.

Known generated or local-only files include:

- `src/renderer/src/generated/bundled-licenses.ts`
- `src/main/debug-data.ts`
- files under `scripts/releases/`
- files under `saved*/`
- files under `test-data*/`
- `coverage/`
- `dist/`
- `out/`

When changing `openapi/kc-intake.yaml`, run:

```bash
npm run gen:types
```

When license-related output may change, run:

```bash
npm run gen:licenses
```

## Coding guidelines

- Use TypeScript types explicitly when they improve safety or readability.
- Avoid broad refactoring unless the task asks for it.
- Preserve existing naming and directory conventions.
- Keep Electron main, preload, and renderer responsibilities separated.
- Avoid exposing Node.js APIs directly to the renderer.
- Prefer small, reviewable commits.
- Do not add new production dependencies without explaining why they are needed.
- Do not add console logging to production code unless it is intentional and safe.

## Agent commit / PR policy

When an automated agent such as Codex creates commits or pull requests, prefer using the repository's configured agent identity if one is available.

For commits, use the agent-specific Git author/committer configured for the current environment, such as `user.name` and `user.email`, or explicit per-command config such as `git -c user.name=... -c user.email=... commit`.

Do not include issue numbers in commit messages, to avoid accidental auto-closing or other issue automation.

Do not overwrite global Git configuration.

For pull requests, use the GitHub account authenticated in the current agent environment. If the requested agent identity differs from the authenticated GitHub account, explain that before creating the PR.

When a pull request addresses a specific issue, include the issue reference in the pull request body using `#<number>`, such as `#11`. Use this `#<number>` style for issue references regardless of the Git hosting service; do not use full issue URLs for this purpose.

Do not use issue-closing keywords such as `fixes`, `fixed`, `closes`, or `resolves` unless the user explicitly asks the agent to close the issue when the pull request is merged. When the user explicitly asks for issue closure on merge, include a closing keyword such as `Closes #<number>` in the pull request body.

For pull request branches created by automated agents, use `<agent-name>/<short-description>`, where `<agent-name>` is the agent's general name and `<short-description>` is a concise kebab-case summary of the change. For example, use `codex/update-readme-note` for Codex-created branches, and apply the same pattern for other agents.

## AGENTS.md editing policy

Automated agents must not edit `AGENTS.md` by default.

Only edit `AGENTS.md` when the user explicitly requests a change to this file in the current task. Do not include `AGENTS.md` changes opportunistically in unrelated work.

## UI / Japanese text guidelines

- Keep Japanese UI text natural and concise.
- Avoid unnecessarily formal wording in short UI labels.
- Do not change existing Japanese terms unless the task is about wording or usability.
- For user-facing messages, prefer clear Japanese over literal translation.

## Security and privacy

This repository is public. Do not commit secrets or local private files.

Never add the following to the repository:

- API tokens
- passwords
- private keys
- signing certificates
- `.env` files
- Cloudflare tokens
- GitHub tokens
- personal account data
- local saved application data

If a task appears to require secret values, use placeholders and explain where the value should be configured.

## Release / packaging notes

The Windows installer is generated through electron-builder.

Do not change the following without explicit request:

- `package.json` version
- `electron-builder.yml`
- release artifact naming
- update-check URL
- signing-related settings

Release assets are expected to be distributed separately from source code.

## Review guidelines

When reviewing changes, focus on high-impact problems first:

- Game communication must not be modified or interfered with.
- Electron main/preload/renderer boundary must remain safe.
- User data and local records must not be leaked.
- Generated files should not be manually edited.
- Build, typecheck, lint, and test commands should remain valid.
- Installer/update behavior should not change accidentally.
- Do not flag minor style preferences unless they may cause real maintenance issues.

## File editing rules

Use UTF-8 without BOM.

When editing files, preserve existing line endings when practical.

Do not escape `$` unnecessarily in shell examples.

When showing example paths, use generic paths such as `path/to/file.ext` unless a real repository path is needed.

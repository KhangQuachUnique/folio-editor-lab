# folio-editor-lab

Practical editor-engine evaluation for **Wridea**, a hybrid publishing platform that needs Notion-like writing speed and magazine-grade typography/layout control.

The lab compares:

- [Tiptap 3](https://tiptap.dev/docs/editor/getting-started/overview)
- [BlockNote](https://www.blocknotejs.org/docs)
- [Plate](https://platejs.org/docs)

Lexical is intentionally deferred. The three approved candidates already cover the relevant architecture range, and the current evidence does not expose a gap that requires a fourth prototype.

## What is implemented

Each engine has an isolated route with the same editorial fixture and controls for:

- rich-text formatting, undo, and redo;
- selection-based quick formatting (native in BlockNote, lab UI for Tiptap and Plate);
- slash commands;
- a shared block library with click or drag insertion;
- a shared document navigator with guarded `Ctrl`/`⌘` drag reordering and keyboard-accessible move buttons;
- image insertion, alignment/resize path;
- typography and spacing controls;
- two-column composition;
- a custom callout block;
- JSON inspection, local save, restore, and reset;
- a 250-paragraph stress fixture.

Implementation status is shown above each editor as **Native**, **Extension**, **Custom**, or **Gap**. This avoids presenting custom prototype code as a built-in engine capability.

## Stack

- Next.js 16 App Router, React 19, TypeScript
- npm lockfile for reproducible installs
- Playwright Chromium for E2E checks and bounded benchmark runs
- Browser `performance` entries for route JS bytes and readiness
- Chromium heap estimate when exposed by the browser

No database, authentication, upload backend, collaboration server, analytics platform, or paid service is required.

## Repository structure

```text
src/app/                    # landing page, methodology, editor routes
src/components/editors/     # one adapter/prototype per engine
src/components/lab/         # shared comparison workbench
src/lib/fixtures.ts         # shared content and 250-block fixture
tests/                      # Playwright behavior checks
scripts/benchmark.mjs       # bounded local benchmark
docs/EVALUATION.md          # feature matrix, scores, recommendation
docs/UX-V2.md               # interaction contract and known prototype limits
docs/benchmark-results.json # raw and summarized measurements
docs/DECISIONS.md           # confirmed project decisions
```

## Run locally

Requirements: Node.js 20.9+ and npm.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Verify

```bash
npm run lint
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

Run the benchmark against a production server:

```bash
npm run build
npm run start -- --hostname 127.0.0.1 --port 4173
# in another terminal
npm run benchmark
```

`BENCHMARK_RUNS=5` changes the run count. `BENCHMARK_BASE_URL` changes the target URL.

## Current result

The provisional recommendation is **Tiptap** for the main product. After the UX v2 additions it still produced the best long-document typing result and lowest long-fixture heap in this lab, while offering the most direct control over a product-specific document schema. Plate now has the smallest route transfer; BlockNote remains the fastest route to a polished Notion-style MVP.

Read the evidence and caveats in [docs/EVALUATION.md](docs/EVALUATION.md).
The shared interaction model is documented in [docs/UX-V2.md](docs/UX-V2.md).

## Scope boundary

This repository is a selection lab, not production editor infrastructure. Image upload, real-time collaboration, comments, server persistence, migrations, mobile/IME testing, and accessibility audits belong to a later product spike after the engine decision is accepted.

# Editor engine evaluation

Date: 2026-11-09  
Status: **Implemented and locally verified; recommendation not yet accepted**

## 1. Decision in one paragraph

Use **Tiptap** for the Wridea product spike. It gives the strongest fit for a custom publishing schema, retained the lowest long-document typing latency and heap after the UX v2 additions, and supports official bubble-menu and drag-handle primitives. Plate's route is now smaller and mounts slightly faster, so Tiptap is not the universal performance winner. The remaining Tiptap cost is real: slash UI, polished media controls, and magazine layout UX must be designed and maintained by Wridea. Choose **BlockNote** instead if shipping a polished Notion-like MVP faster matters more than schema/layout control and the team accepts either custom column work or the GPL/commercial multi-column package.

## 2. Architecture and fair-test contract

All editors run in one Next.js production build but on separate statically generated routes. This keeps framework, fonts, page shell, test data, browser, machine, and measurement code constant while preserving route-level code splitting.

```text
shared semantic fixture
        │
        ├── Tiptap adapter ─── Tiptap JSON
        ├── BlockNote adapter ─ BlockNote JSON
        └── Plate adapter ───── Slate/Plate JSON
                 │
        shared controls + localStorage
                 │
        Playwright E2E + benchmark
```

The serialized schemas are intentionally not forced into one artificial interchange format. A production system should define its canonical document contract only after an engine is chosen; otherwise the lab would accidentally make the adapter layer the product architecture.

## 3. Feature evidence

| Capability | Tiptap | BlockNote | Plate |
|---|---|---|---|
| Basic formatting/history | Native StarterKit | Native UI | First-party plugins |
| Slash commands | Small custom menu; full UX must be built | Native menu + custom items | Small custom menu; full registry UI is app-owned |
| Block library | Shared Wridea click/drag UI; engine adapter verified | Shared Wridea UI plus native slash menu | Shared Wridea click/drag UI; engine adapter verified |
| Block reorder | Official DragHandle plus shared guarded navigator | Native side menu plus shared guarded navigator | Shared guarded navigator; polished in-canvas handle still app-owned |
| Selection toolbar | Official BubbleMenu, configured by the app | Native formatting toolbar | Small app-owned floating toolbar using Plate transforms |
| Image insert | Image extension | Native image block | Media plugin |
| Image resize | Tiptap 3 resize node view | Native preview resize | Custom persistent range control in this lab; first-party resizable primitives exist |
| Image alignment | Custom image attribute/UI | Native block alignment | Custom node property/UI |
| Color/font size/line height | TextStyle extensions | Theme/native colors; arbitrary type scale needs custom work | Basic-style plugins |
| Multi-column layout | Custom schema nodes | Custom MPL-safe layout block in lab | MIT layout plugin |
| Full BlockNote multi-column package | N/A | `@blocknote/xl-multi-column` is GPL-3.0 or proprietary | N/A |
| Custom blocks | First-class Node extension | React block spec + schema | `createPlatePlugin` + app renderer |
| JSON save/restore | Verified | Verified | Verified |
| 250-block fixture | Verified | Verified | Verified |

“Available” does not mean “production complete.” Upload security, responsive art direction, captions, paste normalization, migrations, and collaborative history were not built.

## 4. Performance results

Local environment: Node 26.13.0, Playwright Chromium 158 fallback build, Next.js production server on loopback, three isolated browser contexts per engine, 250 paragraphs. Values are medians unless stated otherwise.

| Engine | Editor ready | Route JS transfer | JS decoded | Typing ms/character | p95 typing | Heap after long fixture |
|---|---:|---:|---:|---:|---:|---:|
| Tiptap | 359 ms | 357 KiB | 1,145 KiB | 4.03 ms | 4.83 ms | 14.0 MiB |
| BlockNote | 362 ms | 460 KiB | 1,501 KiB | 5.04 ms | 5.47 ms | 24.1 MiB |
| Plate | 330 ms | 319 KiB | 1,058 KiB | 6.66 ms | 6.94 ms | 29.1 MiB |

Interpretation:

- Tiptap had the lowest typing latency and long-fixture heap, but its official drag-handle addition made its route larger than Plate's.
- Plate mounted fastest and transferred the least route JavaScript, while using the most heap after the long fixture in this run.
- BlockNote pays for a much richer ready-made UI. Its larger route is expected, not automatically a product failure.
- CPU was not sampled as a standalone percentage. Typing latency is the useful interaction proxy used here.
- Playwright transport overhead is included in typing timing, so compare engines within this run; do not treat the absolute numbers as end-user latency.

Raw samples: [`benchmark-results.json`](benchmark-results.json).

## 5. Ecosystem and license snapshot

Snapshot taken 2026-11-09 from npm metadata and the upstream GitHub repositories.

| Engine | Package license used here | GitHub stars | Forks | Recent upstream push |
|---|---|---:|---:|---|
| Tiptap | MIT core | 38,995 | 3,200 | 2026-11-08 |
| BlockNote | MPL-2.0 core | 10,367 | 789 | 2026-11-06 |
| Plate | MIT packages | 16,694 | 998 | 2026-11-08 |

Sources: [Tiptap repository](https://github.com/ueberdosis/tiptap), [BlockNote repository](https://github.com/TypeCellOS/BlockNote), [Plate repository](https://github.com/udecode/plate), and the installed package metadata in `package-lock.json`.

Important license distinction: BlockNote core is MPL-2.0, while its official multi-column package currently declares `GPL-3.0 OR PROPRIETARY`. The lab therefore uses a custom core-compatible layout block and does not import that package. Legal review is still required before a commercial release; this is an engineering observation, not legal advice.

## 6. Provisional scorecard

Weights reflect Wridea’s stated product: product fit 35, author UX 25, measured performance 20, and development-cost efficiency 20. A higher development-cost score means less expected work.

| Engine | Product fit /35 | Author UX /25 | Performance /20 | Cost efficiency /20 | Total /100 |
|---|---:|---:|---:|---:|---:|
| Tiptap | 32 | 20 | 18 | 12 | **82** |
| BlockNote | 25 | 24 | 13 | 18 | **80** |
| Plate | 30 | 19 | 15 | 12 | **76** |

The score is directional: this is a product trade-off, not a universal winner. Tiptap gains author-UX evidence from the verified bubble toolbar and guarded drag path; Plate gains measured route-size evidence. If the priority changes from magazine control to fastest Notion-like MVP, BlockNote becomes the recommendation.

## 7. Why Lexical is deferred

Lexical should be added only if the next spike finds a material issue in Tiptap around accessibility, IME behavior, collaboration, or recovery that Lexical plausibly solves. Adding it now would expand the lab without answering a currently open product question.

## 8. Risks and next acceptance step

Before accepting Tiptap for the main product, run one focused product spike with:

1. a canonical Wridea schema and migration version field;
2. responsive column/figure behavior on desktop and mobile;
3. Vietnamese IME, copy/paste from Google Docs/Word, and keyboard-only editing;
4. image upload with validation, retry, and recoverable placeholders;
5. one collaboration/recovery scenario if collaboration is in the first release;
6. 1,000+ real article blocks on representative low-end hardware.

Do not start backend persistence or document migration until the engine and canonical JSON contract are explicitly accepted.

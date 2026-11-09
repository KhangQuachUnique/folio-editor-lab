# Confirmed decisions

## 2026-11-09 — Lab scope

- **Decision:** Build a minimal Next.js + TypeScript lab comparing Tiptap, BlockNote, and Plate; consider Lexical only if needed.
- **Scope:** Editor-engine selection for Wridea, not the production publishing platform.
- **Rationale:** The goal is a practical product decision using equivalent prototypes and bounded measurements, without overengineering.

## 2026-11-09 — Repository location

- **Decision:** Store this repository at `/home/soul/Dự án/wridea/folio-editor-lab`.
- **Scope:** Local project organization.
- **Rationale:** `wridea` is the umbrella for the main project family; later projects such as `wridea-fe` and `wridea-be` can be organized alongside this lab under it.

## 2026-11-09 — Remote repository

- **Decision:** Use `https://github.com/KhangQuachUnique/folio-editor-lab.git` with default branch `main`.
- **Scope:** Source control for this lab.
- **Rationale:** This is the user-provided repository for the approved experiment.

## 2026-11-09 — UX v2 comparison contract

- **Decision:** Add the same Wridea block library and guarded `Ctrl`/`⌘` reorder navigator to all three prototypes, while retaining each engine's native editing controls where available.
- **Scope:** Comparable authoring workflow inside the selection lab; not the final production editor UI.
- **Rationale:** The shared shell makes insertion and reordering directly comparable, while native BlockNote controls and official Tiptap primitives still expose the real build-versus-buy trade-off.

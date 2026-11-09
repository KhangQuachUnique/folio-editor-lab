# UX v2 interaction contract

Date: 2026-11-09  
Status: **Implemented and verified in the comparison lab**

This iteration tests a faster block workflow without hiding the differences between editor engines. The shared shell is product UI owned by Wridea; engine-native controls remain inside each editor.

## Shared workbench

### Block library

The left dock exposes Paragraph, Heading, Quote, Image, Columns, and Callout blocks.

- Click inserts a block at the editor's current insertion position.
- Dragging a library item anywhere onto the page inserts the same block and shows a drop state.
- The prototype intentionally inserts at the current editor position, not at the exact vertical drop coordinate. Exact positional dropping needs a separate engine-specific adapter before production.

### Block navigator

The navigator displays top-level document blocks and supports two reorder paths:

- hold `Ctrl` on Windows/Linux or `⌘` on macOS while dragging a row;
- use the visible up/down buttons for a deterministic pointer and keyboard path.

The modifier guard reduces accidental document moves while selecting or scrolling. The long-document view renders the first 40 rows and reports the remaining count so the lab does not turn a benchmark fixture into 250 sidebar controls.

## Engine-specific editing UX

### Tiptap

- Uses Tiptap's official `BubbleMenu` for Bold, Italic, color, and alignment on text selection.
- Uses the official DragHandle React extension for in-canvas block handles.
- The in-canvas handle also requires `Ctrl`/`⌘` when a drag starts.
- The shared block dock remains custom product UI.

### BlockNote

- Keeps BlockNote's native selection formatting toolbar, slash menu, side menu, and drag handle.
- Enlarges the side-menu hover and drop margins to make block controls easier to reveal and target.
- Adds the same shared library and guarded navigator used by the other engines, while preserving native behavior for comparison.

### Plate

- Adds a small selection toolbar for Bold, Italic, color, and alignment.
- Uses Plate's editor transforms for insertion and shared-navigator reordering.
- `DndPlugin` is present, but a polished in-canvas drag handle still requires Plate registry UI or app-owned components; the shared navigator is the verified reorder path in this lab.

## Verified behavior

Playwright checks all three routes for:

1. editor mount and JSON availability;
2. save, 250-block load, and restore;
3. quick formatting controls appearing for a real text selection;
4. real pointer drag from the block library into the editor;
5. `Ctrl` + pointer drag reordering in the navigator.

The drag tests use actual mouse movement rather than synthetic `dragTo()` because native HTML drag initiation depends on the source being inside the viewport and crossing a movement threshold.

## Production limits

This is an engine-selection prototype. It does not yet cover exact-coordinate drop placement, nested-block navigator reordering, touch drag gestures, multi-selection moves, collaborative conflict handling, or a full keyboard-accessibility audit.

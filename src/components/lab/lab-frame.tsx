"use client";

import Link from "next/link";
import { type DragEvent, type ReactNode, useMemo, useState } from "react";
import type { Capability } from "@/lib/fixtures";

export type BlockKind = "paragraph" | "heading" | "quote" | "image" | "columns" | "callout";
export type OutlineBlock = { label: string; type: string };

type LabFrameProps = {
  name: string;
  version: string;
  license: string;
  mountMs: number | null;
  capabilities: Capability[];
  json: unknown;
  toolbar: ReactNode;
  children: ReactNode;
  onSave: () => void;
  onRestore: () => void;
  onReset: () => void;
  onLoadLong: () => void;
  onInsertBlock: (kind: BlockKind) => void;
  outline: OutlineBlock[];
  onReorderBlock: (from: number, to: number) => void;
};

const statusLabels = {
  native: "Native",
  extension: "Extension",
  custom: "Custom",
  gap: "Gap",
} as const;

const blockLibrary: Array<{ kind: BlockKind; icon: string; label: string; note: string }> = [
  { kind: "paragraph", icon: "¶", label: "Paragraph", note: "Body copy" },
  { kind: "heading", icon: "H", label: "Heading", note: "Section title" },
  { kind: "quote", icon: "“", label: "Quote", note: "Pull quote" },
  { kind: "image", icon: "▧", label: "Image", note: "Resizable figure" },
  { kind: "columns", icon: "▥", label: "Columns", note: "Two-column layout" },
  { kind: "callout", icon: "!", label: "Callout", note: "Editorial note" },
];

export function LabFrame({
  name,
  version,
  license,
  mountMs,
  capabilities,
  json,
  toolbar,
  children,
  onSave,
  onRestore,
  onReset,
  onLoadLong,
  onInsertBlock,
  outline,
  onReorderBlock,
}: LabFrameProps) {
  const [showJson, setShowJson] = useState(false);
  const [dropActive, setDropActive] = useState(false);
  const [dragNotice, setDragNotice] = useState("Kéo block vào trang · Ctrl/⌘ + kéo để sắp xếp");
  const formattedJson = useMemo(() => JSON.stringify(json, null, 2), [json]);

  const startLibraryDrag = (event: DragEvent<HTMLButtonElement>, kind: BlockKind) => {
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("application/x-folio-block", kind);
    setDragNotice(`Thả “${blockLibrary.find((item) => item.kind === kind)?.label}” vào trang`);
  };

  const startOutlineDrag = (event: DragEvent<HTMLDivElement>, index: number) => {
    if (!event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      setDragNotice("Giữ Ctrl/⌘ rồi kéo block để tránh di chuyển nhầm khi đang viết");
      return;
    }
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/x-folio-reorder", String(index));
    setDragNotice(`Đang di chuyển block ${index + 1}`);
  };

  const dropOutline = (event: DragEvent<HTMLDivElement>, target: number) => {
    const source = Number(event.dataTransfer.getData("application/x-folio-reorder"));
    if (!Number.isInteger(source)) return;
    event.preventDefault();
    if (source !== target) onReorderBlock(source, target);
    setDragNotice("Đã đổi vị trí block");
  };

  const dropLibraryBlock = (event: DragEvent<HTMLDivElement>) => {
    const kind = event.dataTransfer.getData("application/x-folio-block") as BlockKind;
    if (!blockLibrary.some((item) => item.kind === kind)) return;
    event.preventDefault();
    onInsertBlock(kind);
    setDropActive(false);
    setDragNotice(`Đã chèn ${blockLibrary.find((item) => item.kind === kind)?.label}`);
  };

  return (
    <main className="lab-shell">
      <header className="lab-header">
        <div>
          <Link className="back-link" href="/">← Folio Editor Lab</Link>
          <p className="eyebrow">Engine prototype</p>
          <h1>{name}</h1>
        </div>
        <dl className="lab-meta">
          <div><dt>Version</dt><dd>{version}</dd></div>
          <div><dt>License</dt><dd>{license}</dd></div>
          <div>
            <dt>Editor mount</dt>
            <dd data-testid="mount-ms">{mountMs === null ? "…" : `${mountMs.toFixed(1)} ms`}</dd>
          </div>
        </dl>
      </header>

      <section className="capability-strip" aria-label="Capability implementation status">
        {capabilities.map((capability) => (
          <div className="capability" key={capability.label} title={capability.note}>
            <span className={`status status-${capability.status}`}>
              {statusLabels[capability.status]}
            </span>
            <strong>{capability.label}</strong>
          </div>
        ))}
      </section>

      <section className="editor-workbench" data-editor-ready={mountMs !== null}>
        <div className="workbench-actions">
          <div className="editor-toolbar" aria-label={`${name} formatting toolbar`}>
            {toolbar}
          </div>
          <div className="document-actions">
            <button type="button" onClick={onSave} data-testid="save-json">Save local</button>
            <button type="button" onClick={onRestore} data-testid="restore-json">Restore</button>
            <button type="button" onClick={onLoadLong} data-testid="load-long">Load 250 blocks</button>
            <button type="button" onClick={onReset}>Reset</button>
            <button type="button" onClick={() => setShowJson((value) => !value)}>
              {showJson ? "Hide JSON" : "Inspect JSON"}
            </button>
          </div>
        </div>
        <div className="workbench-body">
          <aside className="block-dock" aria-label="Block library and document navigator">
            <section>
              <div className="dock-heading">
                <span className="dock-kicker">Insert</span>
                <h2>Block library</h2>
              </div>
              <div className="block-library" data-testid="block-library">
                {blockLibrary.map((item) => (
                  <button
                    className="block-library-item"
                    draggable
                    key={item.kind}
                    type="button"
                    onClick={() => onInsertBlock(item.kind)}
                    onDragStart={(event) => startLibraryDrag(event, item.kind)}
                    onDragEnd={() => setDragNotice("Kéo block vào trang · Ctrl/⌘ + kéo để sắp xếp")}
                  >
                    <span className="block-icon">{item.icon}</span>
                    <span><strong>{item.label}</strong><small>{item.note}</small></span>
                  </button>
                ))}
              </div>
            </section>

            <section className="outline-section">
              <div className="dock-heading">
                <span className="dock-kicker">Arrange</span>
                <h2>Block navigator</h2>
              </div>
              <p className="dock-help">Giữ <kbd>Ctrl</kbd>/<kbd>⌘</kbd> và kéo.</p>
              <div className="block-outline" data-testid="block-outline">
                {outline.slice(0, 40).map((item, index) => (
                  <div
                    className="outline-item"
                    draggable
                    key={`${item.type}-${index}`}
                    onDragStart={(event) => startOutlineDrag(event, index)}
                    onDragOver={(event) => {
                      if (event.dataTransfer.types.includes("application/x-folio-reorder")) event.preventDefault();
                    }}
                    onDrop={(event) => dropOutline(event, index)}
                  >
                    <span className="outline-handle" aria-hidden="true">⠿</span>
                    <span className="outline-copy"><small>{item.type}</small><strong>{item.label}</strong></span>
                    <span className="outline-actions">
                      <button type="button" aria-label={`Move block ${index + 1} up`} disabled={index === 0} onClick={() => onReorderBlock(index, index - 1)}>↑</button>
                      <button type="button" aria-label={`Move block ${index + 1} down`} disabled={index === outline.length - 1} onClick={() => onReorderBlock(index, index + 1)}>↓</button>
                    </span>
                  </div>
                ))}
                {outline.length > 40 ? <p className="outline-more">+ {outline.length - 40} blocks</p> : null}
              </div>
            </section>
            <p className="drag-notice" aria-live="polite">{dragNotice}</p>
          </aside>

          <div
            className={`editor-stage ${dropActive ? "is-drop-active" : ""}`}
            onDragEnterCapture={(event) => {
              if (event.dataTransfer.types.includes("application/x-folio-block")) setDropActive(true);
            }}
            onDragOverCapture={(event) => {
              if (event.dataTransfer.types.includes("application/x-folio-block")) {
                event.preventDefault();
                event.stopPropagation();
              }
            }}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDropActive(false);
            }}
            onDropCapture={(event) => {
              if (event.dataTransfer.types.includes("application/x-folio-block")) event.stopPropagation();
              dropLibraryBlock(event);
            }}
          >
            <div className="drop-label">Thả block vào trang</div>
            <div className="editor-canvas" data-testid="editor-canvas">{children}</div>
            {showJson ? <pre className="json-inspector" data-testid="json-inspector">{formattedJson}</pre> : null}
          </div>
        </div>
      </section>

      <p className="lab-hint">
        Type <kbd>/</kbd> for commands. Use the same long fixture on every route before comparing performance.
      </p>
    </main>
  );
}

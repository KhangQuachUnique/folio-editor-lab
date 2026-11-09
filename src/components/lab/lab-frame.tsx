"use client";

import Link from "next/link";
import { type ReactNode, useMemo, useState } from "react";
import type { Capability } from "@/lib/fixtures";

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
};

const statusLabels = {
  native: "Native",
  extension: "Extension",
  custom: "Custom",
  gap: "Gap",
} as const;

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
}: LabFrameProps) {
  const [showJson, setShowJson] = useState(false);
  const formattedJson = useMemo(() => JSON.stringify(json, null, 2), [json]);

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
        <div className="editor-canvas" data-testid="editor-canvas">{children}</div>
        {showJson ? <pre className="json-inspector" data-testid="json-inspector">{formattedJson}</pre> : null}
      </section>

      <p className="lab-hint">
        Type <kbd>/</kbd> for commands. Use the same long fixture on every route before comparing performance.
      </p>
    </main>
  );
}

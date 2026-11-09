"use client";

import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@/components/editors/plate-editor"), {
  ssr: false,
  loading: () => <div className="editor-loading">Loading Plate…</div>,
});

export function PlateClient() {
  return <Editor />;
}

"use client";

import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@/components/editors/blocknote-editor"), {
  ssr: false,
  loading: () => <div className="editor-loading">Loading BlockNote…</div>,
});

export function BlockNoteClient() {
  return <Editor />;
}

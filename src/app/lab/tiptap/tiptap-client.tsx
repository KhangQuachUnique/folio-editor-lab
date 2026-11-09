"use client";

import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@/components/editors/tiptap-editor"), {
  ssr: false,
  loading: () => <div className="editor-loading">Loading Tiptap…</div>,
});

export function TiptapClient() {
  return <Editor />;
}

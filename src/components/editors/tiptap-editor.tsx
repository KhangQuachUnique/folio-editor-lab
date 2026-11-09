"use client";

import { mergeAttributes, Node, type JSONContent } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useEffect, useState } from "react";
import { LabFrame } from "@/components/lab/lab-frame";
import {
  type Capability,
  longParagraphs,
  paragraphs,
  SAMPLE_IMAGE,
  STORAGE_KEYS,
} from "@/lib/fixtures";

const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  draggable: true,
  parseHTML: () => [{ tag: "aside[data-callout]" }],
  renderHTML: ({ HTMLAttributes }) => ["aside", mergeAttributes(HTMLAttributes, { "data-callout": "info" }), 0],
});

const Column = Node.create({
  name: "column",
  group: "column",
  content: "block+",
  isolating: true,
  parseHTML: () => [{ tag: "div[data-column]" }],
  renderHTML: ({ HTMLAttributes }) => ["div", mergeAttributes(HTMLAttributes, { "data-column": "" }), 0],
});

const Columns = Node.create({
  name: "columns",
  group: "block",
  content: "column{2,3}",
  defining: true,
  draggable: true,
  parseHTML: () => [{ tag: "section[data-columns]" }],
  renderHTML: ({ HTMLAttributes }) => ["section", mergeAttributes(HTMLAttributes, { "data-columns": "" }), 0],
});

const AlignedImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: "center",
        parseHTML: (element) => element.getAttribute("data-align") ?? "center",
        renderHTML: (attributes) => ({ "data-align": attributes.align }),
      },
    };
  },
});

const initialContent: JSONContent = {
  type: "doc",
  content: [
    { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "The shape of ideas" }] },
    { type: "paragraph", content: [{ type: "text", text: paragraphs[0] }] },
    { type: "image", attrs: { src: SAMPLE_IMAGE, alt: "Abstract editorial cover", align: "center", width: 760 } },
    { type: "blockquote", content: [{ type: "paragraph", content: [{ type: "text", text: "Design is not decoration. It is an argument made visible." }] }] },
    {
      type: "columns",
      content: [
        { type: "column", content: [{ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Write" }] }, { type: "paragraph", content: [{ type: "text", text: paragraphs[1] }] }] },
        { type: "column", content: [{ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Compose" }] }, { type: "paragraph", content: [{ type: "text", text: paragraphs[2] }] }] },
      ],
    },
    { type: "callout", content: [{ type: "paragraph", content: [{ type: "text", text: "Custom callout block: drag this node, edit its content, then inspect the JSON." }] }] },
    { type: "paragraph", content: [{ type: "text", text: "Type / to open the prototype command menu." }] },
  ],
};

function longContent(): JSONContent {
  return {
    type: "doc",
    content: [
      { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Long document fixture" }] },
      ...longParagraphs().map((text) => ({ type: "paragraph", content: [{ type: "text", text }] })),
    ],
  };
}

const capabilities: Capability[] = [
  { label: "Formatting", status: "native", note: "StarterKit and text-style extensions." },
  { label: "Slash menu", status: "custom", note: "A product-grade menu needs custom suggestion UI." },
  { label: "Drag/drop", status: "extension", note: "ProseMirror supports draggable nodes; polished handles need extra UI." },
  { label: "Image resize", status: "extension", note: "Tiptap 3 image resize node view." },
  { label: "Typography", status: "extension", note: "TextStyleKit plus product CSS." },
  { label: "Columns", status: "custom", note: "Custom schema nodes in this lab." },
  { label: "Custom blocks", status: "native", note: "First-class Node extensions." },
];

const moduleStartedAt = typeof performance === "undefined" ? 0 : performance.now();

export default function TiptapEditor() {
  const [mountMs, setMountMs] = useState<number | null>(null);
  const [json, setJson] = useState<JSONContent>(initialContent);
  const [slashOpen, setSlashOpen] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TextStyleKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      AlignedImage.configure({
        allowBase64: false,
        resize: { enabled: true, minWidth: 160, minHeight: 90, alwaysPreserveAspectRatio: true },
      }),
      Placeholder.configure({ placeholder: "Write your story…" }),
      Callout,
      Column,
      Columns,
    ],
    content: initialContent,
    editorProps: {
      attributes: { class: "tiptap-editor", "data-testid": "editor-input" },
      handleKeyDown: (_view, event) => {
        if (event.key === "/") setSlashOpen(true);
        if (event.key === "Escape") setSlashOpen(false);
        return false;
      },
    },
    onCreate: ({ editor: instance }) => {
      const elapsed = performance.now() - moduleStartedAt;
      setMountMs(elapsed);
      setJson(instance.getJSON());
    },
    onUpdate: ({ editor: instance }) => setJson(instance.getJSON()),
  });

  const loadLong = useCallback(() => {
    editor?.commands.setContent(longContent());
  }, [editor]);

  useEffect(() => {
    if (!editor || mountMs === null) return;
    window.__FOLIO_LAB__ = {
      engine: "tiptap",
      readyAt: performance.now(),
      getJson: () => editor.getJSON(),
      loadLong,
      focusEditor: () => editor.commands.focus("end"),
    };
    return () => { delete window.__FOLIO_LAB__; };
  }, [editor, loadLong, mountMs]);

  const removeSlash = () => {
    if (!editor) return;
    const { from } = editor.state.selection;
    if (from > 0 && editor.state.doc.textBetween(from - 1, from) === "/") {
      editor.chain().focus().deleteRange({ from: from - 1, to: from }).run();
    }
  };

  const runSlash = (command: "heading" | "image" | "callout" | "columns") => {
    if (!editor) return;
    removeSlash();
    if (command === "heading") editor.chain().focus().setHeading({ level: 2 }).run();
    if (command === "image") editor.chain().focus().setImage({ src: SAMPLE_IMAGE, alt: "Editorial cover" }).run();
    if (command === "callout") editor.chain().focus().insertContent({ type: "callout", content: [{ type: "paragraph", content: [{ type: "text", text: "New callout" }] }] }).run();
    if (command === "columns") editor.chain().focus().insertContent({
      type: "columns",
      content: [
        { type: "column", content: [{ type: "paragraph", content: [{ type: "text", text: "Left column" }] }] },
        { type: "column", content: [{ type: "paragraph", content: [{ type: "text", text: "Right column" }] }] },
      ],
    }).run();
    setSlashOpen(false);
  };

  const toolbar = editor ? (
    <>
      <button type="button" className={editor.isActive("bold") ? "is-active" : ""} onClick={() => editor.chain().focus().toggleBold().run()}><b>B</b></button>
      <button type="button" className={editor.isActive("italic") ? "is-active" : ""} onClick={() => editor.chain().focus().toggleItalic().run()}><i>I</i></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()}>Quote</button>
      <span className="toolbar-separator" />
      <button type="button" onClick={() => editor.chain().focus().setColor("#2345c7").run()}>Blue text</button>
      <button type="button" onClick={() => editor.chain().focus().setFontSize("22px").run()}>22 px</button>
      <button type="button" onClick={() => editor.chain().focus().setLineHeight("1.9").run()}>Leading 1.9</button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign("center").run()}>Center</button>
      <span className="toolbar-separator" />
      <button type="button" onClick={() => runSlash("image")}>Image</button>
      <button type="button" onClick={() => runSlash("columns")}>2 columns</button>
      <button type="button" onClick={() => runSlash("callout")}>Callout</button>
      <button type="button" onClick={() => editor.chain().focus().undo().run()}>Undo</button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()}>Redo</button>
    </>
  ) : null;

  return (
    <LabFrame
      name="Tiptap"
      version="3.33.0"
      license="MIT core · paid optional services"
      mountMs={mountMs}
      capabilities={capabilities}
      json={json}
      toolbar={toolbar}
      onSave={() => localStorage.setItem(STORAGE_KEYS.tiptap, JSON.stringify(editor?.getJSON() ?? initialContent))}
      onRestore={() => {
        const saved = localStorage.getItem(STORAGE_KEYS.tiptap);
        if (saved) editor?.commands.setContent(JSON.parse(saved) as JSONContent);
      }}
      onReset={() => editor?.commands.setContent(initialContent)}
      onLoadLong={loadLong}
    >
      {slashOpen ? (
        <div className="slash-menu" role="menu" aria-label="Insert block">
          <button type="button" onClick={() => runSlash("heading")}>Heading 2</button>
          <button type="button" onClick={() => runSlash("image")}>Image</button>
          <button type="button" onClick={() => runSlash("columns")}>Two columns</button>
          <button type="button" onClick={() => runSlash("callout")}>Callout</button>
        </div>
      ) : null}
      <EditorContent editor={editor} />
    </LabFrame>
  );
}

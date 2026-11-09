"use client";

import {
  FontColorPlugin,
  FontSizePlugin,
  LineHeightPlugin,
  TextAlignPlugin,
} from "@platejs/basic-styles/react";
import {
  BlockquotePlugin,
  BoldPlugin,
  H1Plugin,
  H2Plugin,
  ItalicPlugin,
  UnderlinePlugin,
} from "@platejs/basic-nodes/react";
import { DndPlugin } from "@platejs/dnd";
import { insertColumnGroup } from "@platejs/layout";
import { ColumnItemPlugin, ColumnPlugin } from "@platejs/layout/react";
import { insertImage } from "@platejs/media";
import { ImagePlugin } from "@platejs/media/react";
import { KEYS, type Value } from "platejs";
import {
  createPlatePlugin,
  ParagraphPlugin,
  Plate,
  PlateContent,
  PlateElement,
  type PlateElementProps,
  PlateLeaf,
  type PlateLeafProps,
  useEditorRef,
  usePath,
  usePlateEditor,
} from "platejs/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { LabFrame } from "@/components/lab/lab-frame";
import {
  type Capability,
  longParagraphs,
  paragraphs,
  SAMPLE_IMAGE,
  STORAGE_KEYS,
} from "@/lib/fixtures";

function ParagraphElement(props: PlateElementProps) {
  return <PlateElement {...props} as="p" />;
}

function HeadingOneElement(props: PlateElementProps) {
  return <PlateElement {...props} as="h1" />;
}

function HeadingTwoElement(props: PlateElementProps) {
  return <PlateElement {...props} as="h2" />;
}

function BlockquoteElement(props: PlateElementProps) {
  return <PlateElement {...props} as="blockquote" />;
}

function BoldLeaf(props: PlateLeafProps) {
  return <PlateLeaf {...props} as="strong" />;
}

function ItalicLeaf(props: PlateLeafProps) {
  return <PlateLeaf {...props} as="em" />;
}

function UnderlineLeaf(props: PlateLeafProps) {
  return <PlateLeaf {...props} as="u" />;
}

function CalloutElement(props: PlateElementProps) {
  return <PlateElement {...props} as="aside" className="plate-callout" />;
}

function ColumnGroupElement(props: PlateElementProps) {
  return <PlateElement {...props} as="section" className="plate-columns" />;
}

function ColumnElement(props: PlateElementProps) {
  const width = (props.element as { width?: string }).width;
  return <PlateElement {...props} as="div" className="plate-column" style={{ width }} />;
}

function ImageElement(props: PlateElementProps) {
  const editor = useEditorRef();
  const path = usePath();
  const element = props.element as typeof props.element & {
    url: string;
    caption?: string;
    width?: number;
    align?: "left" | "center" | "right";
  };
  const width = element.width ?? 720;
  const margin = element.align === "right" ? "0 0 32px auto" : element.align === "left" ? "0 auto 32px 0" : "0 auto 32px";

  return (
    <PlateElement
      {...props}
      as="figure"
      className="plate-image"
      data-align={element.align ?? "center"}
      style={{ width: `min(${width}px, 100%)`, margin }}
    >
      <div contentEditable={false}>
        {/* Editor media nodes intentionally use a plain img so their URL remains data-driven. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={element.url} alt={element.caption ?? "Editorial image"} draggable={false} />
        <figcaption>{element.caption ?? "Drag the range to resize this image."}</figcaption>
        <label className="image-size-control">
          <span>Width</span>
          <input
            type="range"
            min="240"
            max="920"
            value={width}
            onChange={(event) => editor.tf.setNodes({ width: Number(event.target.value) }, { at: path })}
          />
        </label>
      </div>
      <span hidden>{props.children}</span>
    </PlateElement>
  );
}

const CalloutPlugin = createPlatePlugin({
  key: "callout",
  node: { isElement: true },
}).withComponent(CalloutElement);

const plugins = [
  ParagraphPlugin.withComponent(ParagraphElement),
  H1Plugin.withComponent(HeadingOneElement),
  H2Plugin.withComponent(HeadingTwoElement),
  BlockquotePlugin.withComponent(BlockquoteElement),
  BoldPlugin.withComponent(BoldLeaf),
  ItalicPlugin.withComponent(ItalicLeaf),
  UnderlinePlugin.withComponent(UnderlineLeaf),
  FontColorPlugin,
  FontSizePlugin,
  TextAlignPlugin.configure({
    inject: { targetPlugins: [KEYS.p, KEYS.h1, KEYS.h2] },
  }),
  LineHeightPlugin.configure({
    inject: {
      nodeProps: { defaultNodeValue: 1.5, validNodeValues: [1.2, 1.5, 1.9, 2.2] },
      targetPlugins: [KEYS.p, KEYS.h1, KEYS.h2],
    },
  }),
  ImagePlugin.withComponent(ImageElement),
  ColumnPlugin.withComponent(ColumnGroupElement),
  ColumnItemPlugin.withComponent(ColumnElement),
  CalloutPlugin,
  DndPlugin,
];

const initialValue: Value = [
  { type: "h1", children: [{ text: "The shape of ideas" }] },
  { type: "p", children: [{ text: paragraphs[0] }] },
  { type: "img", url: SAMPLE_IMAGE, caption: "Wridea / Issue 001", width: 760, align: "center", children: [{ text: "" }] },
  { type: "blockquote", children: [{ text: "Design is not decoration. It is an argument made visible." }] },
  {
    type: "column_group",
    children: [
      { type: "column", width: "50%", children: [{ type: "h2", children: [{ text: "Write" }] }, { type: "p", children: [{ text: paragraphs[1] }] }] },
      { type: "column", width: "50%", children: [{ type: "h2", children: [{ text: "Compose" }] }, { type: "p", children: [{ text: paragraphs[2] }] }] },
    ],
  },
  { type: "callout", children: [{ text: "Custom Plate plugin with editable content and serialized JSON." }] },
  { type: "p", children: [{ text: "Type / to open the lab command menu." }] },
];

function longValue(): Value {
  return [
    { type: "h1", children: [{ text: "Long document fixture" }] },
    ...longParagraphs().map((text) => ({ type: "p", children: [{ text }] })),
  ];
}

const capabilities: Capability[] = [
  { label: "Formatting", status: "extension", note: "Composable first-party plugins." },
  { label: "Slash menu", status: "custom", note: "Registry UI is copied into the app; this lab uses a small menu." },
  { label: "Drag/drop", status: "extension", note: "DndPlugin is installed; polished draggable UI requires registry components." },
  { label: "Image resize", status: "custom", note: "Media plugin plus a small persistent range control." },
  { label: "Typography", status: "extension", note: "Basic style plugins for color, size, align, and line height." },
  { label: "Columns", status: "extension", note: "MIT layout plugin with editable column nodes." },
  { label: "Custom blocks", status: "native", note: "createPlatePlugin and app-owned renderers." },
];

const moduleStartedAt = typeof performance === "undefined" ? 0 : performance.now();

type SurfaceProps = {
  value: Value;
  onChange: (value: Value) => void;
  onReady: (editor: ReturnType<typeof usePlateEditor>) => void;
};

function PlateSurface({ value, onChange, onReady }: SurfaceProps) {
  const [slashOpen, setSlashOpen] = useState(false);
  const editor = usePlateEditor({ plugins, value });

  useEffect(() => onReady(editor), [editor, onReady]);

  const insertCallout = () => editor.tf.insertNodes({ type: "callout", children: [{ text: "New callout" }] });
  const insertColumns = () => insertColumnGroup(editor, { columns: 2 });
  const insertPicture = () => insertImage(editor, SAMPLE_IMAGE);

  const runSlash = (command: "heading" | "image" | "columns" | "callout") => {
    if (command === "heading") editor.tf.setNodes({ type: "h2" });
    if (command === "image") insertPicture();
    if (command === "columns") insertColumns();
    if (command === "callout") insertCallout();
    setSlashOpen(false);
  };

  return (
    <>
      {slashOpen ? (
        <div className="slash-menu" role="menu" aria-label="Insert block">
          <button type="button" onClick={() => runSlash("heading")}>Heading 2</button>
          <button type="button" onClick={() => runSlash("image")}>Image</button>
          <button type="button" onClick={() => runSlash("columns")}>Two columns</button>
          <button type="button" onClick={() => runSlash("callout")}>Callout</button>
        </div>
      ) : null}
      <Plate editor={editor} onValueChange={({ value: nextValue }) => onChange(nextValue)}>
        <PlateContent
          className="plate-editor"
          data-testid="editor-input"
          placeholder="Write your story…"
          onKeyDown={(event) => {
            if (event.key === "/") setSlashOpen(true);
            if (event.key === "Escape") setSlashOpen(false);
          }}
        />
      </Plate>
    </>
  );
}

export default function PlateEditor() {
  const editorRef = useRef<ReturnType<typeof usePlateEditor> | null>(null);
  const [mountMs, setMountMs] = useState<number | null>(null);
  const [value, setValue] = useState<Value>(initialValue);
  const [revision, setRevision] = useState(0);

  const replaceDocument = useCallback((nextValue: Value) => {
    setValue(nextValue);
    setRevision((current) => current + 1);
  }, []);

  const loadLong = useCallback(() => replaceDocument(longValue()), [replaceDocument]);

  const handleReady = (editor: ReturnType<typeof usePlateEditor>) => {
    editorRef.current = editor;
    if (mountMs === null) setMountMs(performance.now() - moduleStartedAt);
  };

  useEffect(() => {
    if (mountMs === null || !editorRef.current) return;
    window.__FOLIO_LAB__ = {
      engine: "plate",
      readyAt: performance.now(),
      getJson: () => editorRef.current?.children ?? value,
      loadLong,
      focusEditor: () => editorRef.current?.tf.focus({ edge: "end" }),
    };
    return () => { delete window.__FOLIO_LAB__; };
  }, [loadLong, mountMs, value]);

  const editor = editorRef.current;
  const toolbar = (
    <>
      <button type="button" onClick={() => editor?.tf.toggleMark("bold")}><b>B</b></button>
      <button type="button" onClick={() => editor?.tf.toggleMark("italic")}><i>I</i></button>
      <button type="button" onClick={() => editor?.tf.setNodes({ type: "h2" })}>H2</button>
      <button type="button" onClick={() => editor?.tf.setNodes({ type: "blockquote" })}>Quote</button>
      <span className="toolbar-separator" />
      <button type="button" onClick={() => editor?.tf.addMark("color", "#2345c7")}>Blue text</button>
      <button type="button" onClick={() => editor?.tf.addMark("fontSize", "22px")}>22 px</button>
      <button type="button" onClick={() => editor?.tf.lineHeight.setNodes(1.9)}>Leading 1.9</button>
      <button type="button" onClick={() => editor?.tf.setNodes({ align: "center" })}>Center</button>
      <span className="toolbar-separator" />
      <button type="button" onClick={() => editor && insertImage(editor, SAMPLE_IMAGE)}>Image</button>
      <button type="button" onClick={() => editor && insertColumnGroup(editor, { columns: 2 })}>2 columns</button>
      <button type="button" onClick={() => editor?.tf.insertNodes({ type: "callout", children: [{ text: "New callout" }] })}>Callout</button>
      <button type="button" onClick={() => editor?.tf.undo()}>Undo</button>
      <button type="button" onClick={() => editor?.tf.redo()}>Redo</button>
    </>
  );

  return (
    <LabFrame
      name="Plate"
      version="53.5.2"
      license="MIT core, plugins, and registry UI"
      mountMs={mountMs}
      capabilities={capabilities}
      json={value}
      toolbar={toolbar}
      onSave={() => localStorage.setItem(STORAGE_KEYS.plate, JSON.stringify(editorRef.current?.children ?? value))}
      onRestore={() => {
        const saved = localStorage.getItem(STORAGE_KEYS.plate);
        if (saved) replaceDocument(JSON.parse(saved) as Value);
      }}
      onReset={() => replaceDocument(initialValue)}
      onLoadLong={loadLong}
    >
      <PlateSurface key={revision} value={value} onChange={setValue} onReady={handleReady} />
    </LabFrame>
  );
}

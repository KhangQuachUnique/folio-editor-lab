"use client";

import {
  BlockNoteSchema,
  defaultProps,
  type PartialBlock,
} from "@blocknote/core";
import {
  filterSuggestionItems,
  insertOrUpdateBlockForSlashMenu,
} from "@blocknote/core/extensions";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import {
  createReactBlockSpec,
  getDefaultReactSlashMenuItems,
  SuggestionMenuController,
  useCreateBlockNote,
} from "@blocknote/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LabFrame, type BlockKind } from "@/components/lab/lab-frame";
import {
  type Capability,
  longParagraphs,
  outlineFromDocument,
  paragraphs,
  SAMPLE_IMAGE,
  STORAGE_KEYS,
} from "@/lib/fixtures";

const createCallout = createReactBlockSpec(
  {
    type: "callout",
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      textColor: defaultProps.textColor,
      tone: { default: "note", values: ["note", "warning"] as const },
    },
    content: "inline",
  },
  {
    render: (props) => (
      <aside className="bn-callout" data-tone={props.block.props.tone}>
        <span className="bn-callout-icon" contentEditable={false}>!</span>
        <div ref={props.contentRef} />
      </aside>
    ),
  },
);

const createMagazineColumns = createReactBlockSpec(
  {
    type: "magazineColumns",
    propSchema: { columns: { default: 2, values: [2, 3] as const } },
    content: "none",
    layoutOnly: true,
  },
  {
    renderFrame: (props) => (
      <section
        className="bn-columns-frame"
        data-column-count={props.block.props.columns}
        ref={props.slotRef}
      />
    ),
  },
);

const schema = BlockNoteSchema.create().extend({
  blockSpecs: {
    callout: createCallout(),
    magazineColumns: createMagazineColumns(),
  },
});

type LabBlock = PartialBlock<
  typeof schema.blockSchema,
  typeof schema.inlineContentSchema,
  typeof schema.styleSchema
>;

const initialContent: LabBlock[] = [
  { type: "heading", props: { level: 1 }, content: "The shape of ideas" },
  { type: "paragraph", content: paragraphs[0] },
  { type: "image", props: { url: SAMPLE_IMAGE, caption: "Wridea / Issue 001", previewWidth: 760 } },
  { type: "quote", content: "Design is not decoration. It is an argument made visible." },
  {
    type: "magazineColumns",
    props: { columns: 2 },
    children: [
      { type: "heading", props: { level: 2 }, content: "Write" },
      { type: "paragraph", content: paragraphs[1] },
      { type: "heading", props: { level: 2 }, content: "Compose" },
      { type: "paragraph", content: paragraphs[2] },
    ],
  },
  { type: "callout", props: { tone: "note" }, content: "Custom block with editable inline content and JSON persistence." },
  { type: "paragraph", content: "Type / to use BlockNote’s native menu plus the two custom commands." },
];

function longContent(): LabBlock[] {
  return [
    { type: "heading", props: { level: 1 }, content: "Long document fixture" },
    ...longParagraphs().map((text) => ({ type: "paragraph" as const, content: text })),
  ];
}

const capabilities: Capability[] = [
  { label: "Formatting", status: "native", note: "Ready-made formatting toolbar and block controls." },
  { label: "Slash menu", status: "native", note: "Built-in menu; custom items are supported." },
  { label: "Drag/drop", status: "native", note: "Block side menu and drag handle included." },
  { label: "Image resize", status: "native", note: "Image block exposes preview width and resize UI." },
  { label: "Typography", status: "custom", note: "Theme/CSS are easy; arbitrary font controls need custom styles." },
  { label: "Columns", status: "custom", note: "Lab uses a layout block. Official full columns are GPL/commercial." },
  { label: "Custom blocks", status: "native", note: "React block specs and custom schema." },
];

const moduleStartedAt = typeof performance === "undefined" ? 0 : performance.now();

export default function BlockNoteEditor() {
  const [mountMs, setMountMs] = useState<number | null>(null);
  const [json, setJson] = useState<unknown>(initialContent);
  const editor = useCreateBlockNote({
    schema,
    initialContent,
    sideMenu: { hoverMargin: 48, dropMargin: 320 },
  });

  const replaceDocument = useCallback((blocks: LabBlock[]) => {
    editor.replaceBlocks(editor.document, blocks);
    setJson(editor.document);
  }, [editor]);

  const loadLong = useCallback(() => replaceDocument(longContent()), [replaceDocument]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMountMs(performance.now() - moduleStartedAt);
      setJson(editor.document);
    });
    return () => cancelAnimationFrame(frame);
  }, [editor]);

  useEffect(() => {
    if (mountMs === null) return;
    window.__FOLIO_LAB__ = {
      engine: "blocknote",
      readyAt: performance.now(),
      getJson: () => editor.document,
      loadLong,
      focusEditor: () => editor.focus(),
    };
    return () => { delete window.__FOLIO_LAB__; };
  }, [editor, loadLong, mountMs]);

  const customSlashItems = useMemo(() => [
    {
      title: "Magazine columns",
      subtext: "Two-column layout block (custom, MPL-safe)",
      aliases: ["columns", "layout", "magazine"],
      group: "Wridea",
      icon: <span>▥</span>,
      onItemClick: () => insertOrUpdateBlockForSlashMenu(editor, { type: "magazineColumns" }),
    },
    {
      title: "Callout",
      subtext: "Editable custom callout",
      aliases: ["callout", "note", "alert"],
      group: "Wridea",
      icon: <span>!</span>,
      onItemClick: () => insertOrUpdateBlockForSlashMenu(editor, { type: "callout" }),
    },
  ], [editor]);

  const insertAfterCursor = (block: LabBlock) => {
    try {
      const cursor = editor.getTextCursorPosition();
      editor.insertBlocks([block], cursor.block, "after");
    } catch {
      const lastBlock = editor.document.at(-1);
      if (lastBlock) editor.insertBlocks([block], lastBlock, "after");
    }
  };

  const insertBlock = (kind: BlockKind) => {
    const blocks: Record<BlockKind, LabBlock> = {
      paragraph: { type: "paragraph", content: "New paragraph" },
      heading: { type: "heading", props: { level: 2 }, content: "New section" },
      quote: { type: "quote", content: "New pull quote" },
      image: { type: "image", props: { url: SAMPLE_IMAGE, caption: "Inserted image", previewWidth: 640 } },
      columns: { type: "magazineColumns", children: [{ type: "paragraph", content: "Left story" }, { type: "paragraph", content: "Right story" }] },
      callout: { type: "callout", content: "New callout" },
    };
    insertAfterCursor(blocks[kind]);
  };

  const reorderBlock = (from: number, to: number) => {
    const blocks = [...editor.document] as unknown as LabBlock[];
    if (from < 0 || to < 0 || from >= blocks.length || to >= blocks.length) return;
    const [moved] = blocks.splice(from, 1);
    blocks.splice(to, 0, moved);
    replaceDocument(blocks);
  };

  const toolbar = (
    <>
      <button type="button" onClick={() => { editor.focus(); editor.toggleStyles({ bold: true }); }}><b>B</b></button>
      <button type="button" onClick={() => { editor.focus(); editor.toggleStyles({ italic: true }); }}><i>I</i></button>
      <button type="button" onClick={() => editor.updateBlock(editor.getTextCursorPosition().block, { type: "heading", props: { level: 2 } })}>H2</button>
      <button type="button" onClick={() => editor.updateBlock(editor.getTextCursorPosition().block, { props: { textAlignment: "center" } })}>Center</button>
      <span className="toolbar-separator" />
      <button type="button" onClick={() => insertAfterCursor({ type: "image", props: { url: SAMPLE_IMAGE, caption: "Inserted image", previewWidth: 640 } })}>Image</button>
      <button type="button" onClick={() => insertAfterCursor({ type: "magazineColumns", children: [{ type: "paragraph", content: "Left story" }, { type: "paragraph", content: "Right story" }] })}>2 columns</button>
      <button type="button" onClick={() => insertAfterCursor({ type: "callout", content: "New callout" })}>Callout</button>
      <button type="button" onClick={() => editor.undo()}>Undo</button>
      <button type="button" onClick={() => editor.redo()}>Redo</button>
    </>
  );

  return (
    <LabFrame
      name="BlockNote"
      version="0.57.0"
      license="MPL-2.0 core · GPL/commercial multi-column add-on"
      mountMs={mountMs}
      capabilities={capabilities}
      json={json}
      toolbar={toolbar}
      onSave={() => localStorage.setItem(STORAGE_KEYS.blocknote, JSON.stringify(editor.document))}
      onRestore={() => {
        const saved = localStorage.getItem(STORAGE_KEYS.blocknote);
        if (saved) replaceDocument(JSON.parse(saved) as LabBlock[]);
      }}
      onReset={() => replaceDocument(initialContent)}
      onLoadLong={loadLong}
      onInsertBlock={insertBlock}
      outline={outlineFromDocument(Array.isArray(json) ? json : [])}
      onReorderBlock={reorderBlock}
    >
      <BlockNoteView
        editor={editor}
        slashMenu={false}
        onChange={() => setJson(editor.document)}
        data-testid="editor-input"
      >
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={async (query) => filterSuggestionItems(
            [...getDefaultReactSlashMenuItems(editor), ...customSlashItems],
            query,
          )}
        />
      </BlockNoteView>
    </LabFrame>
  );
}

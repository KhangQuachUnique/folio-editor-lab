export {};

declare global {
  interface Window {
    __FOLIO_LAB__?: {
      engine: "tiptap" | "blocknote" | "plate";
      readyAt: number;
      getJson: () => unknown;
      loadLong: () => void | Promise<void>;
      focusEditor: () => void;
    };
  }
}

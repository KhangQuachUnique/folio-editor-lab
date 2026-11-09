export const SAMPLE_IMAGE = "/sample-cover.svg";

export const paragraphs = [
  "A publishing tool should make the first sentence effortless and the final spread intentional. The editor is where those two promises meet.",
  "Wridea treats structure and presentation as related but separate concerns: authors shape meaning in blocks, while art direction controls rhythm, hierarchy, and composition.",
  "The useful question is not which engine has the longest feature list. It is which engine leaves the smallest, safest gap between today’s prototype and tomorrow’s product.",
  "Long-form editing exposes different costs than a short demo. Selection stability, history behavior, serialization, and incremental rendering matter once a story grows beyond a few screens.",
];

export function longParagraphs(count = 250) {
  return Array.from({ length: count }, (_, index) =>
    `${index + 1}. ${paragraphs[index % paragraphs.length]} Benchmark paragraph ${index + 1}.`,
  );
}

export type CapabilityStatus = "native" | "extension" | "custom" | "gap";
export type Capability = { label: string; status: CapabilityStatus; note: string };

export const STORAGE_KEYS = {
  tiptap: "folio-lab:tiptap:v1",
  blocknote: "folio-lab:blocknote:v1",
  plate: "folio-lab:plate:v1",
} as const;

function collectText(value: unknown, output: string[]) {
  if (typeof value === "string") {
    output.push(value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectText(item, output));
    return;
  }
  if (!value || typeof value !== "object") return;
  const record = value as Record<string, unknown>;
  if (typeof record.text === "string") output.push(record.text);
  if (record.content) collectText(record.content, output);
  if (record.children) collectText(record.children, output);
}

export function outlineFromDocument(blocks: unknown[]) {
  return blocks.map((block, index) => {
    const record = block && typeof block === "object" ? block as Record<string, unknown> : {};
    const text: string[] = [];
    collectText(record.content ?? record.children, text);
    const type = typeof record.type === "string" ? record.type : "block";
    const label = text.join(" ").replace(/\s+/g, " ").trim().slice(0, 54);
    return { type, label: label || `${type} ${index + 1}` };
  });
}

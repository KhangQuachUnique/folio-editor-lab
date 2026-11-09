import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const baseURL = process.env.BENCHMARK_BASE_URL ?? "http://127.0.0.1:4173";
const runs = Number(process.env.BENCHMARK_RUNS ?? 3);
const engines = ["tiptap", "blocknote", "plate"];
const sampleText = "Wridea measures editing latency.";

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
};

const percentile = (values, ratio) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1)];
};

const browser = await chromium.launch({
  headless: true,
  args: ["--enable-precise-memory-info"],
});

const raw = {};

for (const engine of engines) {
  raw[engine] = [];
  for (let run = 0; run < runs; run += 1) {
    const context = await browser.newContext();
    const page = await context.newPage();
    const wallStarted = performance.now();
    await page.goto(`${baseURL}/lab/${engine}`, { waitUntil: "networkidle" });
    await page.locator("[data-editor-ready='true']").waitFor({ timeout: 20_000 });
    const wallReadyMs = performance.now() - wallStarted;

    const browserMetrics = await page.evaluate(() => {
      const scripts = performance.getEntriesByType("resource")
        .filter((entry) => entry.initiatorType === "script");
      const memory = /** @type {Performance & { memory?: { usedJSHeapSize: number } }} */ (performance).memory;
      return {
        editorReadyMs: window.__FOLIO_LAB__?.readyAt ?? null,
        jsTransferBytes: scripts.reduce((sum, entry) => sum + (entry.transferSize || entry.encodedBodySize || 0), 0),
        jsDecodedBytes: scripts.reduce((sum, entry) => sum + (entry.decodedBodySize || 0), 0),
        heapBytesBeforeLong: memory?.usedJSHeapSize ?? null,
      };
    });

    await page.evaluate(() => window.__FOLIO_LAB__?.loadLong());
    await page.waitForTimeout(100);
    await page.evaluate(() => window.__FOLIO_LAB__?.focusEditor());
    const typingStarted = performance.now();
    await page.keyboard.type(sampleText);
    const typingMs = performance.now() - typingStarted;
    const heapBytesAfterLong = await page.evaluate(() => {
      const memory = /** @type {Performance & { memory?: { usedJSHeapSize: number } }} */ (performance).memory;
      return memory?.usedJSHeapSize ?? null;
    });

    raw[engine].push({
      run: run + 1,
      wallReadyMs,
      typingTotalMs: typingMs,
      typingMsPerCharacter: typingMs / sampleText.length,
      heapBytesAfterLong,
      ...browserMetrics,
    });
    await context.close();
  }
}

await browser.close();

const summary = Object.fromEntries(engines.map((engine) => {
  const samples = raw[engine];
  const collect = (key) => samples.map((sample) => sample[key]).filter((value) => typeof value === "number");
  return [engine, {
    runs,
    medianWallReadyMs: median(collect("wallReadyMs")),
    medianEditorReadyMs: median(collect("editorReadyMs")),
    medianJsTransferBytes: median(collect("jsTransferBytes")),
    medianJsDecodedBytes: median(collect("jsDecodedBytes")),
    medianTypingMsPerCharacter: median(collect("typingMsPerCharacter")),
    p95TypingMsPerCharacter: percentile(collect("typingMsPerCharacter"), 0.95),
    medianHeapBytesAfterLong: median(collect("heapBytesAfterLong")),
  }];
}));

const result = {
  generatedAt: new Date().toISOString(),
  environment: {
    node: process.version,
    browser: "Playwright Chromium",
    baseURL,
    fixtureBlocks: 250,
    runs,
    note: "Directional local benchmark. Playwright transport overhead is included in typing latency.",
  },
  summary,
  raw,
};

await mkdir(resolve("docs"), { recursive: true });
await writeFile(resolve("docs/benchmark-results.json"), `${JSON.stringify(result, null, 2)}\n`, "utf8");
console.log(JSON.stringify(summary, null, 2));

import { expect, type Locator, type Page, test } from "@playwright/test";

const labs = ["tiptap", "blocknote", "plate"] as const;

async function dragWithMouse(page: Page, source: Locator, target: Locator, withControl = false) {
  await source.scrollIntoViewIfNeeded();
  const sourceBox = await source.boundingBox();
  const targetBox = await target.boundingBox();
  if (!sourceBox || !targetBox) throw new Error("Drag source or target is not visible");
  const viewport = page.viewportSize();
  const targetY = Math.max(24, Math.min(targetBox.y + 24, (viewport?.height ?? 720) - 24));
  if (withControl) await page.keyboard.down("Control");
  await page.mouse.move(sourceBox.x + 16, sourceBox.y + 16);
  await page.mouse.down();
  await page.mouse.move(sourceBox.x + 42, sourceBox.y + 16, { steps: 5 });
  await page.mouse.move(targetBox.x + Math.min(80, targetBox.width / 2), targetY, { steps: 12 });
  await page.mouse.up();
  if (withControl) await page.keyboard.up("Control");
}

test("home page links to every editor lab", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Folio Editor Lab" })).toBeVisible();
  for (const engine of labs) {
    await expect(page.locator(`a[href="/lab/${engine}"]`)).toBeVisible();
  }
});

for (const engine of labs) {
  test(`${engine}: mounts, loads long JSON, and restores saved content`, async ({ page }) => {
    await page.goto(`/lab/${engine}`);
    const workbench = page.locator("[data-editor-ready='true']");
    await expect(workbench).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("editor-input")).toBeVisible();

    const initialJson = await page.evaluate(() => JSON.stringify(window.__FOLIO_LAB__?.getJson()));
    expect(initialJson.length).toBeGreaterThan(300);

    await page.getByTestId("save-json").click();
    await page.getByTestId("load-long").click();
    await expect.poll(async () => page.evaluate(() => JSON.stringify(window.__FOLIO_LAB__?.getJson()).length))
      .toBeGreaterThan(20_000);

    await page.getByTestId("restore-json").click();
    await expect.poll(async () => page.evaluate(() => JSON.stringify(window.__FOLIO_LAB__?.getJson())))
      .toBe(initialJson);
  });

  test(`${engine}: inserts from block library and Ctrl-drags outline blocks`, async ({ page }) => {
    await page.goto(`/lab/${engine}`);
    await expect(page.locator("[data-editor-ready='true']")).toBeVisible({ timeout: 20_000 });

    const initialJson = await page.evaluate(() => JSON.stringify(window.__FOLIO_LAB__?.getJson()));
    const callout = page.getByTestId("block-library").getByRole("button", { name: /Callout/ });
    await dragWithMouse(page, callout, page.locator(".editor-stage"));
    await expect.poll(async () => page.evaluate(() => JSON.stringify(window.__FOLIO_LAB__?.getJson()).length))
      .toBeGreaterThan(initialJson.length);

    const beforeReorder = await page.evaluate(() => JSON.stringify(window.__FOLIO_LAB__?.getJson()));
    const items = page.getByTestId("block-outline").locator(".outline-item");
    expect(await items.count()).toBeGreaterThan(1);
    await dragWithMouse(page, items.nth(0), items.nth(1), true);
    await expect.poll(async () => page.evaluate(() => JSON.stringify(window.__FOLIO_LAB__?.getJson())))
      .not.toBe(beforeReorder);
  });

  test(`${engine}: shows quick formatting controls for a text selection`, async ({ page }) => {
    await page.goto(`/lab/${engine}`);
    await expect(page.locator("[data-editor-ready='true']")).toBeVisible({ timeout: 20_000 });

    const editable = page.locator("[contenteditable='true']").first();
    await editable.click({ position: { x: 100, y: 40 } });
    await page.keyboard.press("Control+Home");
    await page.keyboard.down("Shift");
    await page.keyboard.press("End");
    await page.keyboard.up("Shift");

    const quickToolbar = engine === "blocknote"
      ? page.locator(".bn-formatting-toolbar")
      : page.getByTestId("quick-format-toolbar");
    await expect(quickToolbar).toBeVisible();
  });
}

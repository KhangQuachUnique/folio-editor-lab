import { expect, test } from "@playwright/test";

const labs = ["tiptap", "blocknote", "plate"] as const;

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
}

import { expect, test, type Page } from "@playwright/test";

async function closeInitiallyOpenSettings(page: Page): Promise<void> {
  const settings = page.getByRole("dialog", { name: "Settings" });
  if (!(await settings.isVisible().catch(() => false))) return;
  const close = settings.getByRole("button", { name: "close" });
  if (await close.isVisible().catch(() => false)) {
    await close.click();
  } else {
    await page.keyboard.press("Escape");
  }
  await expect(settings).toBeHidden();
}

async function expectPrimaryAboveFold(page: Page, height: number): Promise<void> {
  const primary = page.getByTestId("create-invitation");
  await expect(primary).toBeVisible();
  const box = await primary.boundingBox();
  expect(box, "primary action should have a visible box").not.toBeNull();
  expect((box?.y ?? height) + (box?.height ?? 0)).toBeLessThanOrEqual(height);
}

test("390x844 keeps the private workflow horizontally contained and actionable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./", { waitUntil: "domcontentloaded" });
  await closeInitiallyOpenSettings(page);

  await expect(page.getByRole("button", { name: "Privacy boundary" })).toBeVisible();
  await expectPrimaryAboveFold(page, 844);

  const width = await page.evaluate(() => ({
    body: document.body.scrollWidth,
    document: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));
  expect(width.body).toBeLessThanOrEqual(width.viewport);
  expect(width.document).toBeLessThanOrEqual(width.viewport);
});

test("1141x602 keeps the working primary action above the fold", async ({ page }) => {
  await page.setViewportSize({ width: 1141, height: 602 });
  await page.goto("./", { waitUntil: "domcontentloaded" });
  await closeInitiallyOpenSettings(page);

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expectPrimaryAboveFold(page, 602);
});

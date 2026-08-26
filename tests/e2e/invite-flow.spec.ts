import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { openTwoPeers } from "@baditaflorin/mesh-common/testing";

const pkg = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8")) as {
  name: string;
};

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

test("two peers create and claim one room-scoped invitation", async ({ browser, baseURL }) => {
  const { a, b, cleanup } = await openTwoPeers(browser, baseURL ?? "", {
    storagePrefix: pkg.name,
  });

  try {
    await Promise.all([closeInitiallyOpenSettings(a), closeInitiallyOpenSettings(b)]);
    await Promise.all([
      expect(a.getByRole("heading", { level: 1 })).toBeVisible(),
      expect(b.getByRole("heading", { level: 1 })).toBeVisible(),
    ]);

    await a.getByLabel("Your display name").fill("Avery");
    await b.getByLabel("Your display name").fill("Jordan");
    await a.getByLabel("Invitation purpose").fill("Boardroom access");
    await a.getByLabel(/One-time code/i).fill("DESK-2026");
    await a.getByTestId("create-invitation").click();

    await expect(b.getByText("Boardroom access", { exact: true })).toBeVisible();
    await expect(b.getByText("DESK-2026", { exact: true })).toBeVisible();
    await b.getByRole("button", { name: "Claim invitation" }).click();

    await expect(a.getByText("Claimed by Jordan", { exact: true })).toBeVisible();
    await expect(b.getByRole("button", { name: "Release claim" })).toBeVisible();
  } finally {
    await cleanup();
  }
});

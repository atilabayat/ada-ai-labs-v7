import { test, expect } from "@playwright/test";

// Navigation + the ⌘K commands navigator — real-browser render of the shell,
// complementing the HTTP smoke layer. Sidebar links carry an icon glyph + a
// count badge in their text, so target them by href rather than accessible name.

test("sidebar links navigate between pages", async ({ page }) => {
  await page.goto("/builder");
  await expect(page.getByPlaceholder(/Describe what you want to build/)).toBeVisible();

  await page.locator('a[href="/research"]').click();
  await expect(page).toHaveURL(/\/research/);

  await page.locator('a[href="/wikis"]').click();
  await expect(page).toHaveURL(/\/wikis/);
});

test("command palette navigates", async ({ page }) => {
  await page.goto("/builder");

  // Open via the "⌘K commands" button in the status bar — headless Chromium
  // intercepts the Ctrl+K shortcut itself, so drive the real trigger.
  await page.getByText("⌘K commands").click();

  const input = page.getByPlaceholder(/Search pages, apps, wikis, skills/);
  await expect(input).toBeVisible();

  await input.fill("wikis");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/wikis/);
});

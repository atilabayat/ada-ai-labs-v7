import { test, expect } from "@playwright/test";

// Research → curate → publish → wiki renders. Deterministic: uses the always-
// present SEED_FEED items and the synthesize-off (no-LLM) publish path.

test("curate a research result and publish it to a new wiki", async ({ page }) => {
  const title = `E2E Publish ${Date.now()}`;
  await page.goto("/research");

  // Star the first feed item → the selection action bar appears.
  await page.getByTitle("Add to selection").first().click();
  await expect(page.getByText(/1 selected/)).toBeVisible();

  // Open the publish modal.
  await page.getByRole("button", { name: /Publish to Wiki/ }).click();
  await page.getByPlaceholder(/Title for the new research wiki/).fill(title);

  // Turn synthesis off for a deterministic (no-LLM) publish.
  await page.getByRole("button", { name: /Synthesize narrative/ }).click();

  // Publish.
  await page.getByRole("button", { name: /Publish Wiki/ }).click();

  // Success state ("Wiki published" appears in both the modal and a toast).
  await expect(page.getByText("Wiki published").first()).toBeVisible({ timeout: 20_000 });

  // Open the new wiki and confirm it renders with its title.
  await page.getByRole("button", { name: /Open wiki/ }).click();
  await expect(page.getByText(title).first()).toBeVisible({ timeout: 20_000 });
});

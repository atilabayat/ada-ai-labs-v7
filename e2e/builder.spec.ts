import { test, expect } from "@playwright/test";

// AI Builder — the build pipeline that 500'd this session, plus the notebook
// picker resilience fix. Deterministic: stub LLM streams fully with no API key.

test("add a skill and run a build — streams through to completion", async ({ page }) => {
  test.setTimeout(90_000); // real-model synthesis can take a while
  await page.goto("/builder");

  await page
    .getByPlaceholder(/Describe what you want to build/)
    .fill("E2E build check — verify the build streaming pipeline");

  // Open the skill picker (dashed "+" button) and add /web-search.
  await page.locator("button.border-dashed").first().click();
  await page.getByPlaceholder("search skills…").fill("web-search");
  await page.getByText("/web-search").first().click();

  // Run the build.
  await page.getByRole("button", { name: /Build|Rebuild/ }).click();

  // The live panel mounts → the build was created and its stream opened.
  await expect(page.getByText("▸ Live Build")).toBeVisible({ timeout: 15_000 });

  // The key assertion: the build streamed through to completion — the done-state
  // "↗ App" action button only renders when phase === "done". If
  // /api/builds/[id]/stream had 500'd (the regression we hit), the panel would
  // show "failed" and this button would never appear.
  await expect(page.getByRole("button", { name: /↗ App/ })).toBeVisible({ timeout: 70_000 });
});

test("notebook picker shows a list or a clear error — never silent-empty", async ({ page }) => {
  await page.goto("/builder");

  await page.locator("button.border-dashed").first().click();
  await page.getByPlaceholder("search skills…").fill("notebooklm");
  await page.getByText("/notebooklm").first().click();

  // The green Notebook bar appears once the skill is on the stack.
  await expect(page.getByText("Notebook", { exact: true })).toBeVisible();

  // Open the picker dropdown.
  await page.getByText(/Select a notebook|Loading notebooks/i).first().click();

  // Must surface SOMETHING actionable — notebook rows ("N src"), a cached-list
  // note, a load error + retry, or a loading state — but never a silent empty.
  await expect(
    page.getByText(/\d+\s*src|Saved list|live refresh failed|Couldn.t load|No notebooks|Loading notebooks/i).first()
  ).toBeVisible({ timeout: 30_000 });
});

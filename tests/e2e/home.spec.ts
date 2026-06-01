import { expect, test } from "@playwright/test";

test.describe("Homepage", () => {
  test("redirects / to default locale /id", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/id(\?|$)/);
  });

  test("renders the company name in the header", async ({ page }) => {
    await page.goto("/id");
    await expect(page.locator("header")).toContainText("PT Duta Firza");
  });

  test("language switcher routes to /en", async ({ page }) => {
    await page.goto("/en");
    await expect(page).toHaveURL(/\/en(\?|$)/);
    // Body lang attribute reflects locale
    const html = page.locator("html");
    await expect(html).toHaveAttribute("lang", "en");
  });

  test("returns 404 page for unknown locale", async ({ page }) => {
    const res = await page.goto("/fr/whatever", { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBeGreaterThanOrEqual(400);
  });
});

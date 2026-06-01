import { expect, test } from "@playwright/test";

test.describe("Admin auth gate", () => {
  test("redirects unauthenticated /id/admin to /id/admin/login", async ({ page }) => {
    await page.goto("/id/admin");
    await expect(page).toHaveURL(/\/id\/admin\/login/);
  });

  test("login page renders the form", async ({ page }) => {
    await page.goto("/id/admin/login");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password|kata sandi/i)).toBeVisible();
  });

  test("invalid credentials show an error toast", async ({ page }) => {
    await page.goto("/id/admin/login");
    await page.getByLabel(/email/i).fill("nobody@example.com");
    await page.getByLabel(/password|kata sandi/i).fill("wrongpassword");
    await page.getByRole("button", { name: /masuk|sign in/i }).click();
    // A Sonner toast appears with the error message; assert via role or text fallback
    await expect(
      page.getByText(/email atau kata sandi salah|invalid email or password/i),
    ).toBeVisible({ timeout: 10_000 });
  });
});

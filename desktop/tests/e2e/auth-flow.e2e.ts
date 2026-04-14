import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should load login page on startup", async ({ page }) => {
    await page.goto("/");

    // Wait for app to initialize
    await page.waitForLoadState("networkidle");

    // Check for authentication UI elements
    const loginButton = page.locator("text=Login");
    await expect(loginButton).toBeVisible({ timeout: 5000 });
  });

  test("should show error on invalid credentials", async ({ page }) => {
    await page.goto("/");

    // Find email input
    const emailInput = page.locator("input[type=email]");
    await emailInput.fill("invalid@example.com");

    // Find password input
    const passwordInput = page.locator("input[type=password]");
    await passwordInput.fill("wrongpassword");

    // Click login button
    const loginButton = page.locator("button:has-text('Login')");
    await loginButton.click();

    // Check for error message
    const errorMessage = page.locator("text=Authentication failed");
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test("should navigate to dashboard after successful login", async ({ page }) => {
    await page.goto("/");

    // Fill credentials (mock user)
    const emailInput = page.locator("input[type=email]");
    await emailInput.fill("test@orchestraboxoffice.com");

    const passwordInput = page.locator("input[type=password]");
    await passwordInput.fill("testpassword123");

    // Click login
    const loginButton = page.locator("button:has-text('Login')");
    await loginButton.click();

    // Wait for navigation to dashboard
    await page.waitForURL("**/dashboard", { timeout: 5000 });

    // Verify dashboard is visible
    const dashboardTitle = page.locator("text=Dashboard");
    await expect(dashboardTitle).toBeVisible();
  });

  test("should persist authentication across page reload", async ({ page }) => {
    await page.goto("/");

    // Login
    const emailInput = page.locator("input[type=email]");
    await emailInput.fill("test@orchestraboxoffice.com");

    const passwordInput = page.locator("input[type=password]");
    await passwordInput.fill("testpassword123");

    const loginButton = page.locator("button:has-text('Login')");
    await loginButton.click();

    // Wait for dashboard
    await page.waitForURL("**/dashboard");

    // Reload page
    await page.reload();

    // Should still be authenticated (not redirected to login)
    const dashboardTitle = page.locator("text=Dashboard");
    await expect(dashboardTitle).toBeVisible({ timeout: 5000 });
  });
});

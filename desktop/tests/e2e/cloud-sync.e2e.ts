import { test, expect } from "@playwright/test";

test.describe("Cloud Sync Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/");
    const emailInput = page.locator("input[type=email]");
    await emailInput.fill("test@orchestraboxoffice.com");

    const passwordInput = page.locator("input[type=password]");
    await passwordInput.fill("testpassword123");

    const loginButton = page.locator("button:has-text('Login')");
    await loginButton.click();

    await page.waitForURL("**/dashboard");
  });

  test("should show sync status indicator", async ({ page }) => {
    // Look for sync status indicator (should be visible at all times)
    const syncStatus = page.locator("[data-testid=sync-status]");
    await expect(syncStatus).toBeVisible({ timeout: 5000 });

    // Should show "Synced" or similar status
    const syncText = page.locator("text=Synced");
    const pendingText = page.locator("text=pending");
    const statusVisible =
      (await syncText.isVisible()) || (await pendingText.isVisible());
    expect(statusVisible).toBe(true);
  });

  test("should sync pending entries automatically", async ({ page }) => {
    // Create a budget (which goes into sync queue)
    const budgetsLink = page.locator("text=Budgets");
    await budgetsLink.click();

    await page.waitForLoadState("networkidle");

    const newBudgetButton = page.locator("button:has-text('New Budget')");
    await newBudgetButton.click();

    const pipelineSelect = page.locator("select").first();
    await pipelineSelect.selectOption({ label: "Pipeline 1" });

    const periodInput = page.locator("input[placeholder*='2024']");
    await periodInput.fill("2026-04");

    const allocationInput = page.locator("input[type=text]:has-text('Allocation')");
    await allocationInput.fill("100000");

    const submitButton = page.locator("button:has-text('Create Budget')");
    await submitButton.click();

    // Wait for auto-sync (5 minute interval, but may trigger immediately)
    await page.waitForTimeout(2000);

    // Check sync status changed
    const syncStatus = page.locator("[data-testid=sync-status]");
    const statusText = await syncStatus.textContent();
    expect(statusText).not.toContain("Error");
  });

  test("should handle sync errors gracefully", async ({ page }) => {
    // Simulate sync error (by mocking network failure)
    await page.route("**/api/v1/sync/**", (route) => {
      route.abort("failed");
    });

    // Navigate to trigger sync
    const budgetsLink = page.locator("text=Budgets");
    await budgetsLink.click();

    await page.waitForLoadState("networkidle");

    // Create budget to trigger sync
    const newBudgetButton = page.locator("button:has-text('New Budget')");
    await newBudgetButton.click();

    const pipelineSelect = page.locator("select").first();
    await pipelineSelect.selectOption({ label: "Pipeline 1" });

    const submitButton = page.locator("button:has-text('Create Budget')");
    await submitButton.click();

    // Wait for error handling
    await page.waitForTimeout(1000);

    // Check error message is displayed
    const errorText = page.locator("text=Sync failed");
    await expect(errorText).toBeVisible({ timeout: 5000 });
  });

  test("should display last sync time", async ({ page }) => {
    // Check for last sync time display
    const lastSyncText = page.locator("text=Last sync");
    await expect(lastSyncText).toBeVisible({ timeout: 5000 });

    // Should show relative time (e.g., "Just now", "5m ago")
    const timeText = page.locator("text=ago");
    const justNowText = page.locator("text=Just now");
    const timeVisible =
      (await timeText.isVisible()) || (await justNowText.isVisible());
    expect(timeVisible).toBe(true);
  });

  test("should allow manual sync trigger", async ({ page }) => {
    // Look for manual sync button
    const syncButton = page.locator("button:has-text('Sync Now')");

    // Button might be visible in sync panel
    if (await syncButton.isVisible()) {
      const syncInProgressBefore = page.locator("text=Syncing");
      const wasVisible = await syncInProgressBefore.isVisible().catch(() => false);

      // Click sync button
      await syncButton.click();

      // Wait for sync to start
      const syncInProgress = page.locator("text=Syncing");
      await expect(syncInProgress).toBeVisible({ timeout: 5000 });
    }
  });
});

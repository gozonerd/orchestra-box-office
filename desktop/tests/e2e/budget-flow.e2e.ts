import { test, expect } from "@playwright/test";

test.describe("Budget Management Flow", () => {
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

  test("should create new budget", async ({ page }) => {
    // Navigate to budgets page
    const budgetsLink = page.locator("text=Budgets");
    await budgetsLink.click();

    // Wait for page load
    await page.waitForLoadState("networkidle");

    // Click new budget button
    const newBudgetButton = page.locator("button:has-text('New Budget')");
    await newBudgetButton.click();

    // Fill budget form
    const pipelineSelect = page.locator("select").first();
    await pipelineSelect.selectOption({ label: "Pipeline 1" });

    const periodInput = page.locator("input[placeholder*='2024']");
    await periodInput.fill("2026-04");

    const allocationInput = page.locator("input[type=text]:has-text('Allocation')");
    await allocationInput.fill("100000"); // $1,000.00

    // Submit form
    const submitButton = page.locator("button:has-text('Create Budget')");
    await submitButton.click();

    // Verify budget appears in list
    const budgetRow = page.locator("text=2026-04");
    await expect(budgetRow).toBeVisible({ timeout: 5000 });
  });

  test("should display budget utilization", async ({ page }) => {
    // Navigate to budgets
    const budgetsLink = page.locator("text=Budgets");
    await budgetsLink.click();

    // Wait for page
    await page.waitForLoadState("networkidle");

    // Look for utilization percentage
    const utilizationText = page.locator("text=Utilization");
    await expect(utilizationText).toBeVisible({ timeout: 5000 });

    // Look for progress bar
    const progressBar = page.locator("[role=progressbar]");
    await expect(progressBar).toBeVisible();
  });

  test("should allow quick budget update", async ({ page }) => {
    // Navigate to budgets
    const budgetsLink = page.locator("text=Budgets");
    await budgetsLink.click();

    await page.waitForLoadState("networkidle");

    // Find and click +$100 button
    const quickUpdateButton = page.locator("button:has-text('+$100')").first();
    await quickUpdateButton.click();

    // Verify budget was updated (show success message)
    const successMessage = page.locator("text=Updated");
    await expect(successMessage).toBeVisible({ timeout: 5000 });
  });

  test("should delete budget with confirmation", async ({ page }) => {
    // Navigate to budgets
    const budgetsLink = page.locator("text=Budgets");
    await budgetsLink.click();

    await page.waitForLoadState("networkidle");

    // Count budgets before
    const budgetRows = page.locator("[data-testid=budget-row]");
    const countBefore = await budgetRows.count();

    // Click delete on first budget
    const deleteButton = page.locator("button:has-text('Delete')").first();
    await deleteButton.click();

    // Confirm deletion in dialog
    const confirmButton = page.locator("button:has-text('Confirm')");
    await confirmButton.click();

    // Wait for deletion
    await page.waitForLoadState("networkidle");

    // Verify count decreased
    const countAfter = await budgetRows.count();
    expect(countAfter).toBe(countBefore - 1);
  });
});

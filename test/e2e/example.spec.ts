import { test, expect } from "@playwright/test"

test.describe("start page", () => {
  test("show header", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("text=Rechtsinformationen")).toBeVisible()
    await expect(page.locator("text=des Bundes")).toBeVisible()
  })
})

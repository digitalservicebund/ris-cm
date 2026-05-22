import { test } from "@playwright/test"
import { injectAxe, checkA11y } from "axe-playwright"

test.describe("basic a11y test (index page)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await injectAxe(page)
  })

  test("simple accessibility run", async ({ page }) => {
    await checkA11y(page)
  })

  test("check a11y for the whole page and axe run options", async ({
    page,
  }) => {
    await checkA11y(page, undefined, {
      axeOptions: {
        runOnly: {
          type: "tag",
          values: ["wcag2a"],
        },
      },
    })
  })
})

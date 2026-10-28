import { ADM_SEARCH_URL, expect, PORTAL_BASE_URL, test } from "./a11y-test"
import { injectAxe, checkA11y } from "axe-playwright"

const mockDocument = {
  documentNumber: "KANR100001405",
}

const mockPortalDocument = {
  documentNumber: "KANR100001405",
}

test.describe("basic a11y test (withdraw administrative directive)", () => {
  test.beforeEach(async ({ page }) => {
    await page.route(
      `${ADM_SEARCH_URL}?document-number=KANR100001405`,
      (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockDocument),
        }),
    )
    await page.route(
      `${PORTAL_BASE_URL}/v1/administrative-directive/KANR100001405`,
      (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockPortalDocument),
        }),
    )
    await page.route(
      `${PORTAL_BASE_URL}/v1/administrative-directive/KANR100001405.xml`,
      (route) =>
        route.fulfill({
          status: 200,
          contentType: "text/xml",
          body: "<xml></xml>",
        }),
    )

    await page.goto(
      "/zurueckziehen/verwaltungsvorschriften?dokumentnummer=KANR100001405",
    )
    await injectAxe(page)
    await expect(page.getByText("KANR100001405")).toBeVisible()
  })

  test("simple accessibility run", async ({ page }) => {
    await checkA11y(page)
    await page
      .getByRole("button", { name: "Zurückziehen", exact: true })
      .click()
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
    await page
      .getByRole("button", { name: "Zurückziehen", exact: true })
      .click()
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

import {
  ADM_SEARCH_URL,
  ADM_WITHDRAW_URL,
  PORTAL_BASE_URL,
  test,
} from "./a11y-test"
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
    await page.route(`${ADM_WITHDRAW_URL}`, (route) =>
      route.fulfill({
        status: 200,
        contentType: "text/plain",
        body: "WITHDRAWN",
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

    await page.goto(
      "/zurueckziehen/verwaltungsvorschriften?dokumentnummer=KANR100001405",
    )
    await injectAxe(page)
    await page.getByRole("button", { name: "Zurückziehen" }).click()
    await page.getByRole("button", { name: "Dokument zurückziehen" }).click()
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

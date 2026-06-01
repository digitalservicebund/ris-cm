import { CASELAW_SEARCH_URL, expect, PORTAL_BASE_URL, test } from "./a11y-test"
import { injectAxe, checkA11y } from "axe-playwright"

const mockDocument = {
  documentNumber: "KORE123456789",
  court: "Bundesgerichtshof",
  typ: "Urteil",
  decisionDate: "2024-01-15",
  fileNumber: "IV ZR 123/23",
}

const mockPortalDocument = {
  documentNumber: "KORE123456789",
  courtName: "Bundesgerichtshof",
  documentType: "Urteil",
  decisionDate: "2024-01-15",
  fileNumbers: ["IV ZR 123/23"],
}

test.describe("basic a11y test (withdraw caselaw)", () => {
  test.beforeEach(async ({ page }) => {
    await page.route(
      `${CASELAW_SEARCH_URL}?document-number=KORE123456789`,
      (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockDocument),
        }),
    )
    await page.route(`${PORTAL_BASE_URL}/v1/case-law/KORE123456789`, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockPortalDocument),
      }),
    )

    await page.goto(
      "/zurueckziehen/rechtsprechung?dokumentnummer=KORE123456789",
    )
    await injectAxe(page)
    await expect(page.getByText("IV ZR 123/23")).toBeVisible()
  })

  test("simple accessibility run", async ({ page }) => {
    await checkA11y(page)
    await page.getByRole("button", { name: "Zurückziehen" }).click()
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
    await page.getByRole("button", { name: "Zurückziehen" }).click()
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

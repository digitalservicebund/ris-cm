import { test } from "@playwright/test"
import type { Browser, Page } from "playwright"
import { chromium } from "playwright"
import { injectAxe, checkA11y } from "axe-playwright"

const CASELAW_SEARCH_URL = "http://localhost:9000/api/v1/search"
const PORTAL_BASE_URL = "https://testphase.rechtsinformationen.bund.de"

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

let browser: Browser
let page: Page

test.describe("basic a11y test (withdraw caselaw)", () => {
  test.beforeAll(async () => {
    browser = await chromium.launch()
    page = await browser.newPage()

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
  })

  test("simple accessibility run", async () => {
    await checkA11y(page)
  })

  test("check a11y for the whole page and axe run options", async () => {
    await checkA11y(page, undefined, {
      axeOptions: {
        runOnly: {
          type: "tag",
          values: ["wcag2a"],
        },
      },
    })
  })

  test.afterAll(async () => {
    await browser.close()
  })
})

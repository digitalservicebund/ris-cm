import type { Page } from "@playwright/test"
import { test, expect } from "@playwright/test"

const CASELAW_SEARCH_URL = "http://localhost:9000/api/v1/search"

const mockDocument = {
  documentNumber: "KORE123456789",
  court: "Bundesgerichtshof",
  typ: "Urteil",
  decisionDate: "2024-01-15",
  fileNumber: "IV ZR 123/23",
  visibleInPortal: true,
}

async function mockEnv(page: Page): Promise<void> {
  await page.route("/config/env.json", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        environment: "local",
        portalBaseUrl: "https://testphase.rechtsinformationen.bund.de",
        caselawSearchUrl: CASELAW_SEARCH_URL,
      }),
    }),
  )
}

test.describe("Withdraw caselaw – search", () => {
  test.beforeEach(async ({ page }) => {
    await mockEnv(page)
  })

  test("searching a document number finds the document", async ({ page }) => {
    await page.route(
      `${CASELAW_SEARCH_URL}?document-number=KORE123456789`,
      (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockDocument),
        }),
    )

    await page.goto("/zurueckziehen/rechtsprechung")

    await page
      .getByRole("textbox", { name: "Dokumentnummer" })
      .fill("KORE123456789")
    await page.getByRole("button", { name: "Suche starten" }).click()

    await expect(page.getByText("KORE123456789")).toBeVisible()
    await expect(page.getByText("Bundesgerichtshof")).toBeVisible()
    await expect(page.getByText("Urteil")).toBeVisible()
    await expect(page.getByText("IV ZR 123/23")).toBeVisible()
  })

  test("document number in URL triggers search automatically", async ({
    page,
  }) => {
    await page.route(
      `${CASELAW_SEARCH_URL}?document-number=KORE123456789`,
      (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockDocument),
        }),
    )

    await page.goto(
      "/zurueckziehen/rechtsprechung?dokumentnummer=KORE123456789",
    )

    await expect(page.getByText("KORE123456789")).toBeVisible()
    await expect(page.getByText("Bundesgerichtshof")).toBeVisible()
  })

  test("search with no results shows error message", async ({ page }) => {
    await page.route(
      `${CASELAW_SEARCH_URL}?document-number=UNKNOWN999`,
      (route) =>
        route.fulfill({
          status: 404,
        }),
    )

    await page.goto("/zurueckziehen/rechtsprechung")

    await page
      .getByRole("textbox", { name: "Dokumentnummer" })
      .fill("UNKNOWN999")
    await page.getByRole("button", { name: "Suche starten" }).click()

    await expect(page.getByRole("alert")).toHaveText(
      "Kein Treffer. Die Suche hat keinen Treffer erzielt. Überprüfen Sie Ihre Eingaben.",
    )
  })

  test("submitting without a document number shows validation error", async ({
    page,
  }) => {
    await page.goto("/zurueckziehen/rechtsprechung")

    await page.getByRole("button", { name: "Suche starten" }).click()

    await expect(page.getByRole("alert")).toHaveText(
      "Dokumentnummer fehlt. Um die Suche starten zu können, müssen Sie eine Dokumentnummer eingeben.",
    )
  })
})

import type { Page } from "@playwright/test"
import { test, expect } from "@playwright/test"

const CASELAW_SEARCH_URL = "http://localhost:9000/api/v1/search"
const CASELAW_WITHDRAW_URL = "http://localhost:9000/api/v1/withdraw"
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

async function mockEnv(page: Page): Promise<void> {
  await page.route("/config/env.json", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        environment: "local",
        portalBaseUrl: PORTAL_BASE_URL,
        caselawSearchUrl: CASELAW_SEARCH_URL,
        caselawWithdrawUrl: CASELAW_WITHDRAW_URL,
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
    await page.route(`${PORTAL_BASE_URL}/v1/case-law/KORE123456789`, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockPortalDocument),
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
    await page.route(`${PORTAL_BASE_URL}/v1/case-law/UNKNOWN999`, (route) =>
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

  test("document found only in search API shows data and not visibleInPortal", async ({
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
    await page.route(`${PORTAL_BASE_URL}/v1/case-law/KORE123456789`, (route) =>
      route.fulfill({
        status: 404,
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
    await expect(page.getByText("Nein")).toBeVisible()
  })

  test("document found only in portal API shows data and visibleInPortal", async ({
    page,
  }) => {
    await page.route(
      `${CASELAW_SEARCH_URL}?document-number=KORE123456789`,
      (route) =>
        route.fulfill({
          status: 404,
        }),
    )
    await page.route(`${PORTAL_BASE_URL}/v1/case-law/KORE123456789`, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockPortalDocument),
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
    await expect(page.getByText("Ja")).toBeVisible()
  })
})

test.describe("Withdraw caselaw – withdraw action", () => {
  test.beforeEach(async ({ page }) => {
    await mockEnv(page)
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
  })

  test("clicking Zurückziehen opens a confirmation dialog", async ({
    page,
  }) => {
    await page.goto("/zurueckziehen/rechtsprechung")
    await page
      .getByRole("textbox", { name: "Dokumentnummer" })
      .fill("KORE123456789")
    await page.getByRole("button", { name: "Suche starten" }).click()
    await expect(page.getByText("KORE123456789")).toBeVisible()

    await page.getByRole("button", { name: "Zurückziehen" }).click()

    await expect(
      page.getByRole("alertdialog", { name: "Dokument zurückziehen" }),
    ).toBeVisible()
    await expect(
      page.getByText(
        "Sind Sie sicher, dass Sie dieses Dokument zurückziehen wollen?",
      ),
    ).toBeVisible()
    await expect(
      page.getByText(/Das Dokument wird aus dem Portal entfernt/),
    ).toBeVisible()
  })

  test("clicking Abbrechen closes the dialog without withdrawing", async ({
    page,
  }) => {
    await page.goto("/zurueckziehen/rechtsprechung")
    await page
      .getByRole("textbox", { name: "Dokumentnummer" })
      .fill("KORE123456789")
    await page.getByRole("button", { name: "Suche starten" }).click()
    await expect(page.getByText("KORE123456789")).toBeVisible()

    await page.getByRole("button", { name: "Zurückziehen" }).click()
    await expect(
      page.getByRole("alertdialog", { name: "Dokument zurückziehen" }),
    ).toBeVisible()

    await page.getByRole("button", { name: "Abbrechen" }).click()

    await expect(
      page.getByRole("alertdialog", { name: "Dokument zurückziehen" }),
    ).not.toBeVisible()
    await expect(page.getByText("KORE123456789")).toBeVisible()
  })

  test("confirming withdraw calls the withdraw endpoint and shows success message", async ({
    page,
  }) => {
    await page.route(CASELAW_WITHDRAW_URL, (route) =>
      route.fulfill({ status: 200 }),
    )

    await page.goto("/zurueckziehen/rechtsprechung")
    await page
      .getByRole("textbox", { name: "Dokumentnummer" })
      .fill("KORE123456789")
    await page.getByRole("button", { name: "Suche starten" }).click()
    await expect(page.getByText("KORE123456789")).toBeVisible()

    await page.getByRole("button", { name: "Zurückziehen" }).click()
    await page.getByRole("button", { name: "Dokument zurückziehen" }).click()

    await expect(page.getByRole("alert")).toContainText(
      "Erfolgreich zurückgezogen.",
    )
    await expect(page.getByRole("alert")).toContainText(
      "Das Dokument wurde erfolgreich aus dem Portal entfernt.",
    )
  })

  test("confirming withdraw shows error message when endpoint fails", async ({
    page,
  }) => {
    await page.route(CASELAW_WITHDRAW_URL, (route) =>
      route.fulfill({ status: 500 }),
    )

    await page.goto("/zurueckziehen/rechtsprechung")
    await page
      .getByRole("textbox", { name: "Dokumentnummer" })
      .fill("KORE123456789")
    await page.getByRole("button", { name: "Suche starten" }).click()
    await expect(page.getByText("KORE123456789")).toBeVisible()

    await page.getByRole("button", { name: "Zurückziehen" }).click()
    await page.getByRole("button", { name: "Dokument zurückziehen" }).click()

    await expect(page.getByRole("alert")).toContainText("Fehler.")
    await expect(page.getByRole("alert")).toContainText(
      "Beim Zurückziehen des Dokuments ist ein Fehler aufgetreten",
    )
  })
})

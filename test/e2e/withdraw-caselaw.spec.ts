import type { Locator, Page } from "@playwright/test"
import { test, expect } from "@playwright/test"

const CASELAW_SEARCH_URL = "http://localhost:9000/api/v1/search"
const CASELAW_WITHDRAW_URL = "http://localhost:9000/api/v1/withdraw"
const PORTAL_BASE_URL = "https://testphase.rechtsinformationen.bund.de"

const mockDocument = {
  documentNumber: "KORE123456789",
  court: "Bundesgerichtshof",
  typ: "Urteil",
  decisionDate: "15.01.2024",
  fileNumber: "IV ZR 123/23",
}

const mockPortalDocument = {
  documentNumber: "KORE123456789",
  courtName: "Bundesgerichtshof",
  documentType: "Urteil",
  decisionDate: "2024-01-15",
  fileNumbers: ["IV ZR 123/23"],
}

const mockDocument2 = {
  documentNumber: "KORE234567890",
  court: "BVerfG",
  typ: "Beschluss",
  decisionDate: "27.04.2025",
  fileNumber: "III ZV 16/025",
}

const mockPortalDocument2 = {
  documentNumber: "KORE234567890",
  courtName: "BVerfG",
  documentType: "Beschluss",
  decisionDate: "2025-04-27",
  fileNumbers: ["III ZV 16/025", "III ZA 16/025"],
}

async function expectCellInFirstRowOfColumn(
  table: Locator,
  columnHeader: string,
  value: string,
): Promise<void> {
  await expect(
    table.getByRole("columnheader", { name: columnHeader }),
  ).toBeVisible()
  const headers = await table.getByRole("columnheader").allTextContents()
  const colIndex = headers.findIndex((h) => h.trim() === columnHeader)
  await expect(
    table.getByRole("row").nth(1).getByRole("cell").nth(colIndex),
  ).toContainText(value)
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

test.describe(
  "Withdraw caselaw – search",
  {
    annotation: {
      description:
        "https://digitalservicebund.atlassian.net/browse/RISDEV-10676",
      type: "epic",
    },
    tag: ["@RISDEV-10676"],
  },
  () => {
    test.beforeEach(async ({ page }) => {
      await mockEnv(page)
    })

    test("check auto redirect to withdraw page for caselaw", async ({
      page,
    }) => {
      await page.goto("/")

      await expect(page).toHaveURL("/zurueckziehen/rechtsprechung")
      await expect(
        page.getByRole("radio", { name: "Gerichtsentscheidungen" }),
      ).toBeChecked()
      await expect(
        page.getByRole("radio", { name: "Verwaltungsvorschriften" }),
      ).not.toBeChecked()
      await expect(
        page.getByRole("radio", { name: "Literaturnachweise" }),
      ).not.toBeChecked()
    })

    test("move around the tabs", async ({ page }) => {
      await page.goto("/zurueckziehen/rechtsprechung")

      page.getByRole("radio", { name: "Verwaltungsvorschriften" }).check()

      await expect(page).toHaveURL("/zurueckziehen/verwaltungsvorschriften")
      await expect(
        page.getByRole("radio", { name: "Gerichtsentscheidungen" }),
      ).not.toBeChecked()
      await expect(
        page.getByRole("radio", { name: "Verwaltungsvorschriften" }),
      ).toBeChecked()
      await expect(
        page.getByRole("radio", { name: "Literaturnachweise" }),
      ).not.toBeChecked()

      page.getByRole("radio", { name: "Literaturnachweise" }).check()

      await expect(page).toHaveURL("/zurueckziehen/literatur")
      await expect(
        page.getByRole("radio", { name: "Gerichtsentscheidungen" }),
      ).not.toBeChecked()
      await expect(
        page.getByRole("radio", { name: "Verwaltungsvorschriften" }),
      ).not.toBeChecked()
      await expect(
        page.getByRole("radio", { name: "Literaturnachweise" }),
      ).toBeChecked()

      page.getByRole("radio", { name: "Gerichtsentscheidungen" }).check()

      await expect(page).toHaveURL("/zurueckziehen/rechtsprechung")
      await expect(
        page.getByRole("radio", { name: "Gerichtsentscheidungen" }),
      ).toBeChecked()
      await expect(
        page.getByRole("radio", { name: "Verwaltungsvorschriften" }),
      ).not.toBeChecked()
      await expect(
        page.getByRole("radio", { name: "Literaturnachweise" }),
      ).not.toBeChecked()
    })

    test("searching a document number finds the document, search another document number and show the new result", async ({
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
      await page.route(
        `${PORTAL_BASE_URL}/v1/case-law/KORE123456789`,
        (route) =>
          route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(mockPortalDocument),
          }),
      )
      await page.route(
        `${CASELAW_SEARCH_URL}?document-number=KORE234567890`,
        (route) =>
          route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(mockDocument2),
          }),
      )
      await page.route(
        `${PORTAL_BASE_URL}/v1/case-law/KORE234567890`,
        (route) =>
          route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(mockPortalDocument2),
          }),
      )

      await page.goto("/zurueckziehen/rechtsprechung")

      await page
        .getByRole("textbox", { name: "Dokumentnummer" })
        .fill("KORE123456789")
      await page.getByRole("button", { name: "Suche starten" }).click()

      const table = page.getByRole("table")
      await expectCellInFirstRowOfColumn(
        table,
        "Dokumentnummer",
        "KORE123456789",
      )
      await expectCellInFirstRowOfColumn(table, "Gericht", "Bundesgerichtshof")
      await expectCellInFirstRowOfColumn(table, "Typ", "Urteil")
      await expectCellInFirstRowOfColumn(
        table,
        "Entscheidungsdatum",
        "15.01.2024",
      )
      await expectCellInFirstRowOfColumn(table, "Aktenzeichen", "IV ZR 123/23")
      await expect(
        page.getByRole("button", { name: "Zurückziehen" }),
      ).toBeVisible()
      await expect(page.getByLabel("Portal")).toBeVisible()

      await page
        .getByRole("textbox", { name: "Dokumentnummer" })
        .fill("KORE234567890")
      await page.getByRole("button", { name: "Suche starten" }).click()

      await expectCellInFirstRowOfColumn(
        table,
        "Dokumentnummer",
        "KORE234567890",
      )
      await expectCellInFirstRowOfColumn(table, "Gericht", "BVerfG")
      await expectCellInFirstRowOfColumn(table, "Typ", "Beschluss")
      await expectCellInFirstRowOfColumn(
        table,
        "Entscheidungsdatum",
        "27.04.2025",
      )
      await expectCellInFirstRowOfColumn(table, "Aktenzeichen", "III ZV 16/025")
      await expect(
        page.getByRole("button", { name: "Zurückziehen" }),
      ).toBeVisible()
      await expect(page.getByLabel("Portal")).toBeVisible()
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
      await page.route(
        `${PORTAL_BASE_URL}/v1/case-law/KORE123456789`,
        (route) =>
          route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(mockPortalDocument),
          }),
      )

      await page.goto(
        "/zurueckziehen/rechtsprechung?dokumentnummer=KORE123456789",
      )

      const table = page.getByRole("table")
      await expectCellInFirstRowOfColumn(
        table,
        "Dokumentnummer",
        "KORE123456789",
      )
      await expectCellInFirstRowOfColumn(table, "Gericht", "Bundesgerichtshof")
      await expectCellInFirstRowOfColumn(table, "Typ", "Urteil")
      await expectCellInFirstRowOfColumn(
        table,
        "Entscheidungsdatum",
        "15.01.2024",
      )
      await expectCellInFirstRowOfColumn(table, "Aktenzeichen", "IV ZR 123/23")
      await expect(
        page.getByRole("button", { name: "Zurückziehen" }),
      ).toBeVisible()
      await expect(page.getByLabel("Portal")).toBeVisible()
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
      await page.route(
        `${PORTAL_BASE_URL}/v1/case-law/KORE123456789`,
        (route) =>
          route.fulfill({
            status: 404,
          }),
      )

      await page.goto("/zurueckziehen/rechtsprechung")

      await page
        .getByRole("textbox", { name: "Dokumentnummer" })
        .fill("KORE123456789")
      await page.getByRole("button", { name: "Suche starten" }).click()

      const table = page.getByRole("table")
      await expectCellInFirstRowOfColumn(
        table,
        "Dokumentnummer",
        "KORE123456789",
      )
      await expectCellInFirstRowOfColumn(table, "Gericht", "Bundesgerichtshof")
      await expectCellInFirstRowOfColumn(table, "Typ", "Urteil")
      await expectCellInFirstRowOfColumn(
        table,
        "Entscheidungsdatum",
        "15.01.2024",
      )
      await expectCellInFirstRowOfColumn(table, "Aktenzeichen", "IV ZR 123/23")
      await expectCellInFirstRowOfColumn(table, "Sichtbar im Portal", "Nein")
      await expect(
        page.getByRole("button", { name: "Zurückziehen" }),
      ).toBeVisible()
      await expect(page.getByLabel("Portal")).toBeVisible()
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
      await page.route(
        `${PORTAL_BASE_URL}/v1/case-law/KORE123456789`,
        (route) =>
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

      const table = page.getByRole("table")
      await expectCellInFirstRowOfColumn(
        table,
        "Dokumentnummer",
        "KORE123456789",
      )
      await expectCellInFirstRowOfColumn(table, "Gericht", "Bundesgerichtshof")
      await expectCellInFirstRowOfColumn(table, "Typ", "Urteil")
      await expectCellInFirstRowOfColumn(
        table,
        "Entscheidungsdatum",
        "2024-01-15",
      )
      await expectCellInFirstRowOfColumn(table, "Aktenzeichen", "IV ZR 123/23")
      await expectCellInFirstRowOfColumn(table, "Sichtbar im Portal", "Ja")
      await expect(
        page.getByRole("button", { name: "Zurückziehen" }),
      ).toBeVisible()
      await expect(page.getByLabel("Portal")).toBeVisible()
    })
  },
)

test.describe(
  "Withdraw caselaw – withdraw action",
  {
    annotation: {
      description:
        "https://digitalservicebund.atlassian.net/browse/RISDEV-10676",
      type: "epic",
    },
    tag: ["@RISDEV-10676"],
  },
  () => {
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
      await page.route(
        `${PORTAL_BASE_URL}/v1/case-law/KORE123456789`,
        (route) =>
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
      const table = page.getByRole("table")
      await expectCellInFirstRowOfColumn(
        table,
        "Dokumentnummer",
        "KORE123456789",
      )

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
      const table = page.getByRole("table")
      await expectCellInFirstRowOfColumn(
        table,
        "Dokumentnummer",
        "KORE123456789",
      )

      await page.getByRole("button", { name: "Zurückziehen" }).click()
      await expect(
        page.getByRole("alertdialog", { name: "Dokument zurückziehen" }),
      ).toBeVisible()

      await page.getByRole("button", { name: "Abbrechen" }).click()

      await expect(
        page.getByRole("alertdialog", { name: "Dokument zurückziehen" }),
      ).not.toBeVisible()
      await expectCellInFirstRowOfColumn(
        table,
        "Dokumentnummer",
        "KORE123456789",
      )
    })

    test("confirming withdraw calls the withdraw endpoint and shows success message on WITHDRAWN status", async ({
      page,
    }) => {
      await page.route(CASELAW_WITHDRAW_URL, (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            status: "WITHDRAWN",
            documentNumber: "KORE123456789",
          }),
        }),
      )

      await page.goto(
        "/zurueckziehen/rechtsprechung?dokumentnummer=KORE123456789",
      )
      await page.getByRole("button", { name: "Zurückziehen" }).click()
      await page.getByRole("button", { name: "Dokument zurückziehen" }).click()

      await expect(page.getByRole("alert")).toContainText(
        "Erfolgreich zurückgezogen.",
      )
      const table = page.getByRole("table")
      await expectCellInFirstRowOfColumn(
        table,
        "Dokumentnummer",
        "KORE123456789",
      )
      await expect(
        page.getByRole("button", { name: "Startseite" }),
      ).toBeVisible()
      await expect(
        page.getByRole("button", { name: "Zurück" }),
      ).not.toBeVisible()

      await page.getByRole("button", { name: "Startseite" }).click()

      await expect(page).toHaveURL(/\/zurueckziehen\/rechtsprechung$/)
      await expect(
        page.getByRole("textbox", { name: "Dokumentnummer" }),
      ).toBeVisible()
    })

    test("withdraw shows success message on NOT_FOUND_IN_DATABASE_BUT_WITHDRAWN_FROM_BUCKET status", async ({
      page,
    }) => {
      await page.route(CASELAW_WITHDRAW_URL, (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            status: "NOT_FOUND_IN_DATABASE_BUT_WITHDRAWN_FROM_BUCKET",
            documentNumber: "KORE123456789",
          }),
        }),
      )
      await page.goto(
        "/zurueckziehen/rechtsprechung?dokumentnummer=KORE123456789",
      )
      await page.getByRole("button", { name: "Zurückziehen" }).click()
      await page.getByRole("button", { name: "Dokument zurückziehen" }).click()

      await expect(page.getByRole("alert")).toContainText(
        "Erfolgreich zurückgezogen.",
      )
      const table = page.getByRole("table")
      await expectCellInFirstRowOfColumn(
        table,
        "Dokumentnummer",
        "KORE123456789",
      )
      await expect(
        page.getByRole("button", { name: "Startseite" }),
      ).toBeVisible()
      await expect(
        page.getByRole("button", { name: "Zurück" }),
      ).not.toBeVisible()
    })

    test("withdraw shows info message on NOT_PUBLISHED status", async ({
      page,
    }) => {
      await page.route(CASELAW_WITHDRAW_URL, (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            status: "NOT_PUBLISHED",
            documentNumber: "KORE123456789",
          }),
        }),
      )
      await page.goto(
        "/zurueckziehen/rechtsprechung?dokumentnummer=KORE123456789",
      )
      await page.getByRole("button", { name: "Zurückziehen" }).click()
      await page.getByRole("button", { name: "Dokument zurückziehen" }).click()

      await expect(page.getByRole("alert")).toContainText(
        "Nicht veröffentlicht",
      )
      await expect(page.getByRole("alert")).toContainText(
        "Das Dokument ist aktuell bereits nicht im Portal sichtbar.",
      )
      await expect(
        page.getByText("Folgendes Dokument konnte nicht zurückgezogen werden:"),
      ).toBeVisible()
      const table = page.getByRole("table")
      await expectCellInFirstRowOfColumn(
        table,
        "Dokumentnummer",
        "KORE123456789",
      )
      await expect(page.getByRole("button", { name: "Zurück" })).toBeVisible()
      await expect(
        page.getByRole("button", { name: "Startseite" }),
      ).not.toBeVisible()

      await page.getByRole("button", { name: "Zurück" }).click()

      await expect(page).toHaveURL(
        /\/zurueckziehen\/rechtsprechung\?dokumentnummer=KORE123456789$/,
      )
    })

    test("withdraw shows info message on NOT_FOUND status", async ({
      page,
    }) => {
      await page.route(CASELAW_WITHDRAW_URL, (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            status: "NOT_FOUND",
            documentNumber: "KORE123456789",
          }),
        }),
      )

      await page.goto(
        "/zurueckziehen/rechtsprechung?dokumentnummer=KORE123456789",
      )
      await page.getByRole("button", { name: "Zurückziehen" }).click()
      await page.getByRole("button", { name: "Dokument zurückziehen" }).click()

      await expect(page.getByRole("alert")).toContainText("Nicht gefunden")
      await expect(page.getByRole("alert")).toContainText(
        "Das Dokument konnte nicht gefunden werden.",
      )
      await expect(page.getByRole("button", { name: "Zurück" })).toBeVisible()
    })

    test("withdraw shows error message on 500 error", async ({ page }) => {
      await page.route(CASELAW_WITHDRAW_URL, (route) =>
        route.fulfill({
          status: 500,
          contentType: "application/problem+json",
          body: JSON.stringify({
            detail: "Internal Server Error",
          }),
        }),
      )

      await page.goto(
        "/zurueckziehen/rechtsprechung?dokumentnummer=KORE123456789",
      )
      await page.getByRole("button", { name: "Zurückziehen" }).click()
      await page.getByRole("button", { name: "Dokument zurückziehen" }).click()

      await expect(page.getByRole("alert")).toContainText(
        "Zurückziehen nicht erfolgreich.",
      )
      await expect(page.getByRole("alert")).toContainText(
        "Das Dokument konnte nicht aus dem Portal entfernt werden: Internal Server Error",
      )
      await expect(page.getByRole("button", { name: "Zurück" })).toBeVisible()
    })

    test("result page is not reachable by direct URL navigation", async ({
      page,
    }) => {
      await page.goto("/zurueckziehen/rechtsprechung/ergebnis")

      // Should be redirected away from the result page since there's no state
      await expect(page).toHaveURL(/\/zurueckziehen/)
      await expect(page).not.toHaveURL(/ergebnis/)
    })
  },
)

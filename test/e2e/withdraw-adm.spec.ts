import type { Locator, Page } from "@playwright/test"
import { test, expect } from "@playwright/test"

const ADM_SEARCH_URL = "http://adm-vvbund.example.com/api/v1/search"
const ADM_WITHDRAW_URL = "http://adm-vvbund.example.com/api/v1/withdraw"
const PORTAL_BASE_URL = "https://testphase.rechtsinformationen.bund.de"

const mockDocument = {
  documentNumber: "KANR100001405",
}

const mockPortalDocument = {
  documentNumber: "KANR100001405",
}

async function expectCellInFirstRowOfColumn(
  table: Locator,
  columnHeader: string,
  value: string,
): Promise<void> {
  await expect(table).toContainText(columnHeader + ": " + value)
}

async function mockEnv(page: Page): Promise<void> {
  await page.route("/config/env.json", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        environment: "local",
        portalBaseUrl: PORTAL_BASE_URL,
        caselawSearchUrl: "http://caselaw.example.com/api/v1/search",
        caselawWithdrawUrl: "http://caselaw.example.com/api/v1/withdraw",
        admVVBundSearchUrl: ADM_SEARCH_URL,
        admVVBundWithdrawUrl: ADM_WITHDRAW_URL,
      }),
    }),
  )
}

test.describe(
  "Withdraw administrative directive – search",
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

    test("searching a document number finds the document", async ({ page }) => {
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

      await page.goto("/zurueckziehen/verwaltungsvorschriften")

      await page
        .getByRole("textbox", { name: "Dokumentnummer" })
        .fill("KANR100001405")
      await page.getByRole("button", { name: "Suche starten" }).click()

      const table = page.getByRole("list")
      await expectCellInFirstRowOfColumn(
        table,
        "Dokumentnummer",
        "KANR100001405",
      )
      await expectCellInFirstRowOfColumn(table, "Sichtbar im Portal", "Ja")
      await expect(
        page.getByRole("button", { name: "Zurückziehen" }),
      ).toBeVisible()
      await expect(page.getByLabel("Portal")).toBeVisible()
    })

    test("document number in URL triggers search automatically", async ({
      page,
    }) => {
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

      const table = page.getByRole("list")
      await expectCellInFirstRowOfColumn(
        table,
        "Dokumentnummer",
        "KANR100001405",
      )
      await expect(
        page.getByRole("button", { name: "Zurückziehen" }),
      ).toBeVisible()
      await expect(page.getByLabel("Portal")).toBeVisible()
    })

    test("search with no results shows error message", async ({ page }) => {
      await page.route(
        `${ADM_SEARCH_URL}?document-number=UNKNOWN999`,
        (route) =>
          route.fulfill({
            status: 404,
          }),
      )
      await page.route(
        `${PORTAL_BASE_URL}/v1/administrative-directive/UNKNOWN999`,
        (route) =>
          route.fulfill({
            status: 404,
          }),
      )
      await page.route(
        `${PORTAL_BASE_URL}/v1/administrative-directive/UNKNOWN999.xml`,
        (route) =>
          route.fulfill({
            status: 404,
          }),
      )

      await page.goto("/zurueckziehen/verwaltungsvorschriften")

      await page
        .getByRole("textbox", { name: "Dokumentnummer" })
        .fill("UNKNOWN999")
      await page.getByRole("button", { name: "Suche starten" }).click()

      await expect(page.getByRole("alert")).toHaveText(
        "Kein Treffer. Die Suche hat keinen Treffer erzielt. Überprüfen Sie Ihre Eingaben.",
      )
    })

    test("document found only in search API shows data and not visibleInPortal", async ({
      page,
    }) => {
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
            status: 404,
          }),
      )
      await page.route(
        `${PORTAL_BASE_URL}/v1/administrative-directive/KANR100001405.xml`,
        (route) =>
          route.fulfill({
            status: 404,
          }),
      )

      await page.goto("/zurueckziehen/verwaltungsvorschriften")

      await page
        .getByRole("textbox", { name: "Dokumentnummer" })
        .fill("KANR100001405")
      await page.getByRole("button", { name: "Suche starten" }).click()

      const table = page.getByRole("list")
      await expectCellInFirstRowOfColumn(
        table,
        "Dokumentnummer",
        "KANR100001405",
      )
      await expectCellInFirstRowOfColumn(table, "Sichtbar im Portal", "Nein")
      await expect(
        page.getByRole("button", { name: "Zurückziehen" }),
      ).toBeVisible()
      await expect(page.getByLabel("Portal")).toBeVisible()
    })
  },
)

test.describe(
  "Withdraw administrative directive – withdraw action",
  {
    annotation: {
      description:
        "https://digitalservicebund.atlassian.net/browse/RISDEV-10675",
      type: "epic",
    },
    tag: ["@RISDEV-10675"],
  },
  () => {
    test.beforeEach(async ({ page }) => {
      await mockEnv(page)
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
    })

    test("clicking Zurückziehen opens a confirmation dialog", async ({
      page,
    }) => {
      await page.goto("/zurueckziehen/verwaltungsvorschriften")
      await page
        .getByRole("textbox", { name: "Dokumentnummer" })
        .fill("KANR100001405")
      await page.getByRole("button", { name: "Suche starten" }).click()
      const table = page.getByRole("list")
      await expectCellInFirstRowOfColumn(
        table,
        "Dokumentnummer",
        "KANR100001405",
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
    })

    test("clicking Abbrechen closes the dialog without withdrawing", async ({
      page,
    }) => {
      await page.goto("/zurueckziehen/verwaltungsvorschriften")
      await page
        .getByRole("textbox", { name: "Dokumentnummer" })
        .fill("KANR100001405")
      await page.getByRole("button", { name: "Suche starten" }).click()
      const table = page.getByRole("list")
      await expectCellInFirstRowOfColumn(
        table,
        "Dokumentnummer",
        "KANR100001405",
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
        "KANR100001405",
      )
    })

    test("confirming withdraw calls the withdraw endpoint and shows success message on WITHDRAWN status", async ({
      page,
    }) => {
      await page.route(ADM_WITHDRAW_URL, (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            status: "WITHDRAWN",
            documentNumber: "KANR100001405",
          }),
        }),
      )

      await page.goto(
        "/zurueckziehen/verwaltungsvorschriften?dokumentnummer=KANR100001405",
      )
      await page.getByRole("button", { name: "Zurückziehen" }).click()
      await page.getByRole("button", { name: "Dokument zurückziehen" }).click()

      await expect(page.getByRole("alert")).toContainText(
        "Erfolgreich zurückgezogen.",
      )
      const table = page.getByRole("list")
      await expectCellInFirstRowOfColumn(
        table,
        "Dokumentnummer",
        "KANR100001405",
      )
      await expect(
        page.getByRole("button", { name: "Startseite" }),
      ).toBeVisible()
      await expect(
        page.getByRole("button", { name: "Zurück" }),
      ).not.toBeVisible()
    })

    test("withdraw shows info message on NOT_FOUND status", async ({
      page,
    }) => {
      await page.route(ADM_WITHDRAW_URL, (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            status: "NOT_FOUND",
            documentNumber: "KANR100001405",
          }),
        }),
      )

      await page.goto(
        "/zurueckziehen/verwaltungsvorschriften?dokumentnummer=KANR100001405",
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
      await page.route(ADM_WITHDRAW_URL, (route) =>
        route.fulfill({
          status: 500,
          contentType: "application/problem+json",
          body: JSON.stringify({
            detail: "Internal Server Error",
          }),
        }),
      )

      await page.goto(
        "/zurueckziehen/verwaltungsvorschriften?dokumentnummer=KANR100001405",
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
      await page.goto("/zurueckziehen/verwaltungsvorschriften/ergebnis")

      // Should be redirected away from the result page since there's no state
      await expect(page).toHaveURL(/\/zurueckziehen/)
      await expect(page).not.toHaveURL(/ergebnis/)
    })
  },
)

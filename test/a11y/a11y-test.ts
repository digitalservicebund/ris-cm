import { test as base } from "@playwright/test"

export const CASELAW_SEARCH_URL = "http://localhost:9000/api/v1/search"
export const CASELAW_WITHDRAW_URL = "http://localhost:9000/api/v1/withdraw"
export const PORTAL_BASE_URL = "https://testphase.rechtsinformationen.bund.de"

export const test = base.extend({
  page: async ({ page }, use) => {
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

    await use(page)
  },
})

export { expect } from "@playwright/test"

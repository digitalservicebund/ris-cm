import { test as base } from "@playwright/test"

export const CASELAW_SEARCH_URL = "http://caselaw.example.com/api/v1/search"
export const CASELAW_WITHDRAW_URL = "http://caselaw.example.com/api/v1/withdraw"
export const ADM_SEARCH_URL = "http://adm-vvbund.example.com/api/v1/search"
export const ADM_WITHDRAW_URL = "http://adm-vvbund.example.com/api/v1/withdraw"
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
          admVVBundSearchUrl: ADM_SEARCH_URL,
          admVVBundWithdrawUrl: ADM_WITHDRAW_URL,
        }),
      }),
    )

    await use(page)
  },
})

export { expect } from "@playwright/test"

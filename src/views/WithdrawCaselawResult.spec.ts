import { ref } from "vue"
import { render, waitFor } from "@testing-library/vue"
import { createRouter, createWebHistory } from "vue-router"
import { describe, test, expect, vi, beforeEach } from "vitest"
import PrimeVue from "primevue/config"
import ConfirmationService from "primevue/confirmationservice"
import WithdrawCaselawResult from "@/views/WithdrawCaselawResult.vue"
import type { CaselawSearchResult } from "@/lib/caselaw"
import { search } from "@/lib/caselaw"
import type { useEnv } from "@/lib/env"

vi.mock("@/lib/caselaw", () => ({
  searchCaselaw: vi.fn<() => Promise<CaselawSearchResult[]>>(),
}))

vi.mock("@/lib/env", () => ({
  useEnv: vi
    .fn<() => ReturnType<typeof useEnv>>()
    .mockReturnValue({ env: ref(undefined) }),
}))

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/zurueckziehen",
      name: "withdraw",
      component: { template: "<div>Withdraw</div>" },
    },
    {
      path: "/zurueckziehen/rechtsprechung",
      name: "withdraw-caselaw",
      component: { template: "<div>WithdrawCaselaw</div>" },
    },
    {
      path: "/zurueckziehen/rechtsprechung/ergebnis",
      name: "withdraw-caselaw-result",
      component: WithdrawCaselawResult,
    },
  ],
})

function renderWithState(state: Record<string, unknown>) {
  globalThis.history.replaceState({ ...globalThis.history.state, ...state }, "")
  return render(WithdrawCaselawResult, {
    global: { plugins: [router, PrimeVue, ConfirmationService] },
  })
}

describe("WithdrawCaselawResult", () => {
  beforeEach(async () => {
    await router.push("/zurueckziehen/rechtsprechung/ergebnis")
    vi.mocked(search).mockResolvedValue([])
  })

  describe("redirect behavior", () => {
    test("redirects to 'withdraw' when no withdrawResult is in state", async () => {
      renderWithState({})

      await waitFor(() =>
        expect(router.currentRoute.value.name).toBe("withdraw"),
      )
    })

    test("does not redirect when withdrawResult is set", async () => {
      renderWithState({
        withdrawResult: JSON.stringify({
          status: "ERROR",
          documentNumber: "KORE500102022",
          detail: "Error during publishing",
        }),
      })

      expect(router.currentRoute.value.name).toBe("withdraw-caselaw-result")
    })
  })
})

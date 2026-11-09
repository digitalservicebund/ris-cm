import { ref } from "vue"
import { render, waitFor } from "@testing-library/vue"
import { createRouter, createWebHistory } from "vue-router"
import { describe, test, expect, vi, beforeEach } from "vitest"
import WithdrawAdmResult from "@/views/WithdrawAdmResult.vue"
import type { AdministrativeDirectiveSearchResult } from "@/lib/administrativeDirective"
import { search } from "@/lib/administrativeDirective"
import type { useEnv } from "@/lib/env"

vi.mock("@/lib/administrativeDirective", () => ({
  search: vi.fn<() => Promise<AdministrativeDirectiveSearchResult[]>>(),
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
      path: "/zurueckziehen/verwaltungsvorschriften",
      name: "withdraw-adm",
      component: { template: "<div>WithdrawAdm</div>" },
    },
    {
      path: "/zurueckziehen/verwaltungsvorschriften/ergebnis",
      name: "withdraw-adm-result",
      component: WithdrawAdmResult,
    },
  ],
})

function renderWithState(state: Record<string, unknown>) {
  globalThis.history.replaceState({ ...globalThis.history.state, ...state }, "")
  return render(WithdrawAdmResult, {
    global: { plugins: [router] },
  })
}

describe("WithdrawAdmResult", () => {
  beforeEach(async () => {
    await router.push("/zurueckziehen/verwaltungsvorschriften/ergebnis")
    vi.mocked(search).mockResolvedValue([])
  })

  describe("redirect behavior", () => {
    test("redirects to 'withdraw' when no withdrawResult is in state", async () => {
      renderWithState({})

      await waitFor(() =>
        expect(router.currentRoute.value.name).toBe("withdraw"),
      )
    })

    test("does not redirect when withdrawResult is set", () => {
      renderWithState({
        withdrawResult: JSON.stringify({
          status: "ERROR",
          documentNumber: "KANR100001405",
          detail: "Error during publishing",
        }),
      })

      expect(router.currentRoute.value.name).toBe("withdraw-adm-result")
    })
  })
})

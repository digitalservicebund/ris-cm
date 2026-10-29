import { render, screen, waitFor } from "@testing-library/vue"
import { ref } from "vue"
import { createRouter, createWebHistory } from "vue-router"
import { describe, test, expect, vi, beforeEach } from "vitest"
import WithdrawAdm from "@/views/WithdrawAdm.vue"
import { userEvent } from "@testing-library/user-event"
import type { AdministrativeDirectiveSearchResult } from "@/lib/administrativeDirective"
import type { useEnv } from "@/lib/env"
import PrimeVue from "primevue/config"
import ConfirmationService from "primevue/confirmationservice"

vi.mock("@/lib/administrativeDirective", () => ({
  search: vi
    .fn<() => Promise<AdministrativeDirectiveSearchResult[]>>()
    .mockResolvedValue([
      {
        documentNumber: "KANR100001405",
        visibleInPortal: true,
      },
    ]),
  withdraw: vi
    .fn<() => Promise<{ status: string; documentNumber: string }>>()
    .mockResolvedValue({
      status: "WITHDRAWN",
      documentNumber: "KANR100001405",
    }),
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
      path: "/zurueckziehen/verwaltungsvorschriften",
      name: "withdraw-adm",
      component: WithdrawAdm,
    },
    {
      path: "/zurueckziehen/verwaltungsvorschriften/ergebnis",
      name: "withdraw-adm-result",
      component: { template: "<div>Result</div>" },
    },
  ],
})

function renderComponent() {
  return render(WithdrawAdm, {
    global: { plugins: [router, PrimeVue, ConfirmationService] },
  })
}

describe("WithdrawAdm", () => {
  beforeEach(async () => {
    await router.push("/zurueckziehen/verwaltungsvorschriften")
  })

  test("calls search when search event is emitted", async () => {
    const { search } = await import("@/lib/administrativeDirective")
    const user = userEvent.setup()
    renderComponent()

    await user.type(
      screen.getByRole("textbox", { name: "Dokumentnummer" }),
      "KANR100001405",
    )
    await user.click(screen.getByRole("button", { name: "Suche starten" }))

    await waitFor(() => {
      expect(search).toHaveBeenCalledWith("KANR100001405")
    })
  })

  test("triggers search on mount when dokumentnummer query param is present", async () => {
    const { search } = await import("@/lib/administrativeDirective")
    vi.mocked(search).mockClear()
    await router.push(
      "/zurueckziehen/verwaltungsvorschriften?dokumentnummer=KANR100001405",
    )
    renderComponent()

    await waitFor(() => {
      expect(search).toHaveBeenCalledWith("KANR100001405")
    })
  })

  test("displays search results after successful search", async () => {
    const { search } = await import("@/lib/administrativeDirective")
    vi.mocked(search).mockClear()
    const user = userEvent.setup()
    renderComponent()

    await user.type(
      screen.getByRole("textbox", { name: "Dokumentnummer" }),
      "KANR100001405",
    )
    await user.click(screen.getByRole("button", { name: "Suche starten" }))

    await waitFor(() => {
      expect(screen.getByText("KANR100001405")).toBeInTheDocument()
    })
  })

  test("calls withdrawDocument when withdraw is confirmed", async () => {
    const { withdraw, search } = await import("@/lib/administrativeDirective")
    vi.mocked(search).mockClear()
    const user = userEvent.setup()
    renderComponent()

    await user.type(
      screen.getByRole("textbox", { name: "Dokumentnummer" }),
      "KANR100001405",
    )
    await user.click(screen.getByRole("button", { name: "Suche starten" }))

    await waitFor(() => {
      expect(screen.getByText("KANR100001405")).toBeInTheDocument()
    })

    await user.click(screen.getByRole("button", { name: "Zurückziehen" }))
    await user.click(
      screen.getByRole("button", { name: "Dokument zurückziehen" }),
    )

    await waitFor(() => {
      expect(withdraw).toHaveBeenCalledWith("KANR100001405")
    })
  })

  test("navigates to result page with withdrawResult in history state after successful withdraw", async () => {
    const { search } = await import("@/lib/administrativeDirective")
    vi.mocked(search).mockClear()
    const user = userEvent.setup()
    renderComponent()

    await user.type(
      screen.getByRole("textbox", { name: "Dokumentnummer" }),
      "KANR100001405",
    )
    await user.click(screen.getByRole("button", { name: "Suche starten" }))
    await waitFor(() =>
      expect(screen.getByText("KANR100001405")).toBeInTheDocument(),
    )

    await user.click(screen.getByRole("button", { name: "Zurückziehen" }))
    await user.click(
      screen.getByRole("button", { name: "Dokument zurückziehen" }),
    )

    await waitFor(() => {
      expect(router.currentRoute.value.name).toBe("withdraw-adm-result")
      const state = globalThis.history.state as { withdrawResult?: string }
      const parsed = state.withdrawResult
        ? JSON.parse(state.withdrawResult)
        : null
      expect(parsed?.status).toBe("WITHDRAWN")
      expect(parsed?.documentNumber).toBe("KANR100001405")
    })
  })

  test("navigates to result page with ERROR status when withdraw fails", async () => {
    const { withdraw, search } = await import("@/lib/administrativeDirective")
    vi.mocked(search).mockClear()
    vi.mocked(withdraw).mockResolvedValueOnce({
      status: "ERROR",
      documentNumber: "KANR100001405",
      detail: "Fehler vom Server.",
    })
    const user = userEvent.setup()
    renderComponent()

    await user.type(
      screen.getByRole("textbox", { name: "Dokumentnummer" }),
      "KANR100001405",
    )
    await user.click(screen.getByRole("button", { name: "Suche starten" }))
    await waitFor(() =>
      expect(screen.getByText("KANR100001405")).toBeInTheDocument(),
    )

    await user.click(screen.getByRole("button", { name: "Zurückziehen" }))
    await user.click(
      screen.getByRole("button", { name: "Dokument zurückziehen" }),
    )

    await waitFor(() => {
      expect(router.currentRoute.value.name).toBe("withdraw-adm-result")
      const state = globalThis.history.state as { withdrawResult?: string }
      const parsed = state.withdrawResult
        ? JSON.parse(state.withdrawResult)
        : null
      expect(parsed?.status).toBe("ERROR")
      expect(parsed?.detail).toBe("Fehler vom Server.")
    })
  })
})

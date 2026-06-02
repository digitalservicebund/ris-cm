import { render, screen, waitFor } from "@testing-library/vue"
import { ref } from "vue"
import { createRouter, createWebHistory } from "vue-router"
import { describe, test, expect, vi, beforeEach } from "vitest"
import WithdrawCaselaw from "@/views/WithdrawCaselaw.vue"
import { userEvent } from "@testing-library/user-event"
import type { CaselawSearchResult } from "@/lib/caselaw"
import type { useEnv } from "@/lib/env"
import PrimeVue from "primevue/config"
import ConfirmationService from "primevue/confirmationservice"

vi.mock("@/lib/caselaw", () => ({
  search: vi.fn<() => Promise<CaselawSearchResult[]>>().mockResolvedValue([
    {
      documentNumber: "KORE500102022",
      court: "BGH",
      typ: "Urteil",
      decisionDate: "2022-01-01",
      fileNumber: "IX ZR 1/22",
      visibleInPortal: true,
    },
  ]),
  withdraw: vi
    .fn<() => Promise<{ status: string; documentNumber: string }>>()
    .mockResolvedValue({
      status: "WITHDRAWN",
      documentNumber: "KORE500102022",
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
      path: "/zurueckziehen/rechtsprechung",
      name: "withdraw-caselaw",
      component: WithdrawCaselaw,
    },
    {
      path: "/zurueckziehen/rechtsprechung/ergebnis",
      name: "withdraw-caselaw-result",
      component: { template: "<div>Result</div>" },
    },
  ],
})

function renderComponent() {
  return render(WithdrawCaselaw, {
    global: { plugins: [router, PrimeVue, ConfirmationService] },
  })
}

describe("WithdrawCaselaw", () => {
  beforeEach(async () => {
    await router.push("/zurueckziehen/rechtsprechung")
  })

  test("calls search when search event is emitted", async () => {
    const { search } = await import("@/lib/caselaw")
    const user = userEvent.setup()
    renderComponent()

    await user.type(
      screen.getByRole("textbox", { name: "Dokumentnummer" }),
      "KORE500102022",
    )
    await user.click(screen.getByRole("button", { name: "Suche starten" }))

    await waitFor(() => {
      expect(search).toHaveBeenCalledWith("KORE500102022")
    })
  })

  test("triggers search on mount when dokumentnummer query param is present", async () => {
    const { search } = await import("@/lib/caselaw")
    vi.mocked(search).mockClear()
    await router.push(
      "/zurueckziehen/rechtsprechung?dokumentnummer=KORE500102022",
    )
    renderComponent()

    await waitFor(() => {
      expect(search).toHaveBeenCalledWith("KORE500102022")
    })
  })

  test("displays search results after successful search", async () => {
    const { search } = await import("@/lib/caselaw")
    vi.mocked(search).mockClear()
    const user = userEvent.setup()
    renderComponent()

    await user.type(
      screen.getByRole("textbox", { name: "Dokumentnummer" }),
      "KORE500102022",
    )
    await user.click(screen.getByRole("button", { name: "Suche starten" }))

    await waitFor(() => {
      expect(screen.getByText("KORE500102022")).toBeInTheDocument()
    })
  })

  test("calls withdrawDocument when withdraw is confirmed", async () => {
    const { withdraw, search } = await import("@/lib/caselaw")
    vi.mocked(search).mockClear()
    const user = userEvent.setup()
    renderComponent()

    await user.type(
      screen.getByRole("textbox", { name: "Dokumentnummer" }),
      "KORE500102022",
    )
    await user.click(screen.getByRole("button", { name: "Suche starten" }))

    await waitFor(() => {
      expect(screen.getByText("KORE500102022")).toBeInTheDocument()
    })

    await user.click(screen.getByRole("button", { name: "Zurückziehen" }))
    await user.click(
      screen.getByRole("button", { name: "Dokument zurückziehen" }),
    )

    await waitFor(() => {
      expect(withdraw).toHaveBeenCalledWith("KORE500102022")
    })
  })

  test("navigates to result page with withdrawResult in history state after successful withdraw", async () => {
    const { search } = await import("@/lib/caselaw")
    vi.mocked(search).mockClear()
    const user = userEvent.setup()
    renderComponent()

    await user.type(
      screen.getByRole("textbox", { name: "Dokumentnummer" }),
      "KORE500102022",
    )
    await user.click(screen.getByRole("button", { name: "Suche starten" }))
    await waitFor(() =>
      expect(screen.getByText("KORE500102022")).toBeInTheDocument(),
    )

    await user.click(screen.getByRole("button", { name: "Zurückziehen" }))
    await user.click(
      screen.getByRole("button", { name: "Dokument zurückziehen" }),
    )

    await waitFor(() => {
      expect(router.currentRoute.value.name).toBe("withdraw-caselaw-result")
      const state = globalThis.history.state as { withdrawResult?: string }
      const parsed = state.withdrawResult
        ? JSON.parse(state.withdrawResult)
        : null
      expect(parsed?.status).toBe("WITHDRAWN")
      expect(parsed?.documentNumber).toBe("KORE500102022")
    })
  })

  test("navigates to result page with ERROR status when withdraw fails", async () => {
    const { withdraw, search } = await import("@/lib/caselaw")
    vi.mocked(search).mockClear()
    vi.mocked(withdraw).mockResolvedValueOnce({
      status: "ERROR",
      documentNumber: "KORE500102022",
      detail: "Fehler vom Server.",
    })
    const user = userEvent.setup()
    renderComponent()

    await user.type(
      screen.getByRole("textbox", { name: "Dokumentnummer" }),
      "KORE500102022",
    )
    await user.click(screen.getByRole("button", { name: "Suche starten" }))
    await waitFor(() =>
      expect(screen.getByText("KORE500102022")).toBeInTheDocument(),
    )

    await user.click(screen.getByRole("button", { name: "Zurückziehen" }))
    await user.click(
      screen.getByRole("button", { name: "Dokument zurückziehen" }),
    )

    await waitFor(() => {
      expect(router.currentRoute.value.name).toBe("withdraw-caselaw-result")
      const state = globalThis.history.state as { withdrawResult?: string }
      const parsed = state.withdrawResult
        ? JSON.parse(state.withdrawResult)
        : null
      expect(parsed?.status).toBe("ERROR")
      expect(parsed?.detail).toBe("Fehler vom Server.")
    })
  })
})

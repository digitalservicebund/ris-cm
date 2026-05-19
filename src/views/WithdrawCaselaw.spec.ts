import { render, screen, waitFor } from "@testing-library/vue"
import { ref } from "vue"
import { createRouter, createWebHistory } from "vue-router"
import { describe, test, expect, vi, beforeEach } from "vitest"
import WithdrawCaselaw from "@/views/WithdrawCaselaw.vue"
import { userEvent } from "@testing-library/user-event"
import type { CaselawDocument } from "@/lib/caselaw"
import type { useEnv } from "@/lib/env"

vi.mock("@/lib/caselaw", () => ({
  searchCaselaw: vi.fn<() => Promise<CaselawDocument[]>>().mockResolvedValue([
    {
      documentNumber: "KORE500102022",
      court: "BGH",
      typ: "Urteil",
      decisionDate: "2022-01-01",
      fileNumber: "IX ZR 1/22",
      visibleInPortal: true,
    },
  ]),
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
  ],
})

function renderComponent() {
  return render(WithdrawCaselaw, {
    global: { plugins: [router] },
  })
}

describe("WithdrawCaselaw", () => {
  beforeEach(async () => {
    await router.push("/zurueckziehen/rechtsprechung")
  })

  test("calls searchCaselaw when search event is emitted", async () => {
    const { searchCaselaw } = await import("@/lib/caselaw")
    const user = userEvent.setup()
    renderComponent()

    await user.type(
      screen.getByRole("textbox", { name: "Dokumentnummer" }),
      "KORE500102022",
    )
    await user.click(screen.getByRole("button", { name: "Suche starten" }))

    await waitFor(() => {
      expect(searchCaselaw).toHaveBeenCalledWith("KORE500102022")
    })
  })

  test("triggers search on mount when dokumentnummer query param is present", async () => {
    const { searchCaselaw } = await import("@/lib/caselaw")
    vi.mocked(searchCaselaw).mockClear()
    await router.push(
      "/zurueckziehen/rechtsprechung?dokumentnummer=KORE500102022",
    )
    renderComponent()

    await waitFor(() => {
      expect(searchCaselaw).toHaveBeenCalledWith("KORE500102022")
    })
  })

  test("shows error message when search returns no results", async () => {
    const { searchCaselaw } = await import("@/lib/caselaw")
    vi.mocked(searchCaselaw).mockClear().mockResolvedValueOnce([])
    const user = userEvent.setup()
    renderComponent()

    await user.type(
      screen.getByRole("textbox", { name: "Dokumentnummer" }),
      "UNBEKANNT",
    )
    await user.click(screen.getByRole("button", { name: "Suche starten" }))

    await waitFor(() => {
      expect(screen.getByText("Kein Treffer.")).toBeInTheDocument()
      expect(
        screen.getByText(
          "Die Suche hat keinen Treffer erzielt. Überprüfen Sie Ihre Eingaben.",
        ),
      ).toBeInTheDocument()
    })
  })

  test("shows error message when search throws an error", async () => {
    const { searchCaselaw } = await import("@/lib/caselaw")
    vi.mocked(searchCaselaw).mockClear().mockRejectedValueOnce(new Error("500"))
    const user = userEvent.setup()
    renderComponent()

    await user.type(
      screen.getByRole("textbox", { name: "Dokumentnummer" }),
      "KORE500102022",
    )
    await user.click(screen.getByRole("button", { name: "Suche starten" }))

    await waitFor(() => {
      expect(screen.getByText("Fehler.")).toBeInTheDocument()
      expect(
        screen.getByText(
          "Während der Suche ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut: Error: 500",
        ),
      ).toBeInTheDocument()
    })
  })

  test("shows error message when document number is missing", async () => {
    renderComponent()
    const user = userEvent.setup()

    await user.click(screen.getByRole("button", { name: "Suche starten" }))

    await waitFor(() => {
      expect(screen.getByText("Dokumentnummer fehlt.")).toBeInTheDocument()
      expect(
        screen.getByText(
          "Um die Suche starten zu können, müssen Sie eine Dokumentnummer eingeben.",
        ),
      ).toBeInTheDocument()
    })
  })
})

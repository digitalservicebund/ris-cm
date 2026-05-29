import { nextTick, ref } from "vue"
import { render, screen, waitFor } from "@testing-library/vue"
import { userEvent } from "@testing-library/user-event"
import { createRouter, createWebHistory } from "vue-router"
import { describe, test, expect, vi, beforeEach } from "vitest"
import PrimeVue from "primevue/config"
import ConfirmationService from "primevue/confirmationservice"
import WithdrawCaselawResult from "@/views/WithdrawCaselawResult.vue"
import type { CaselawSearchResult } from "@/lib/caselaw"
import { searchCaselaw } from "@/lib/caselaw"
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
    vi.mocked(searchCaselaw).mockResolvedValue([
      {
        documentNumber: "KORE500102022",
        court: "BGH",
        typ: "Urteil",
        decisionDate: "2022-01-01",
        fileNumber: "IX ZR 1/22",
        visibleInPortal: true,
      },
    ])
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

  describe("status: WITHDRAWN", () => {
    test("shows success message, withdrawn heading, search results and Startseite button", async () => {
      renderWithState({
        withdrawResult: JSON.stringify({
          status: "WITHDRAWN",
          documentNumber: "KORE500102022",
        }),
      })

      await nextTick()

      expect(screen.getByText("Erfolgreich zurückgezogen.")).toBeInTheDocument()
      expect(
        screen.getByText(
          "Das Dokument wurde erfolgreich aus dem Portal entfernt.",
        ),
      ).toBeInTheDocument()
      expect(
        screen.getByText("Folgendes Dokument wurde zurückgezogen:"),
      ).toBeInTheDocument()
      expect(screen.getByText("KORE500102022")).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: "Startseite" }),
      ).toBeInTheDocument()

      expect(vi.mocked(searchCaselaw)).toHaveBeenCalledWith("KORE500102022")
    })
  })

  describe("status: NOT_FOUND_IN_DATABASE_BUT_WITHDRAWN_FROM_BUCKET", () => {
    test("shows success message, withdrawn heading, search results and Startseite button", async () => {
      renderWithState({
        withdrawResult: JSON.stringify({
          status: "NOT_FOUND_IN_DATABASE_BUT_WITHDRAWN_FROM_BUCKET",
          documentNumber: "KORE500102022",
        }),
      })

      await nextTick()

      expect(screen.getByText("Erfolgreich zurückgezogen.")).toBeInTheDocument()
      expect(
        screen.getByText(
          "Das Dokument wurde erfolgreich aus dem Portal entfernt.",
        ),
      ).toBeInTheDocument()
      expect(
        screen.getByText("Folgendes Dokument wurde zurückgezogen:"),
      ).toBeInTheDocument()
      expect(screen.getByText("KORE500102022")).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: "Startseite" }),
      ).toBeInTheDocument()

      expect(vi.mocked(searchCaselaw)).toHaveBeenCalledWith("KORE500102022")
    })
  })

  describe("status: NOT_PUBLISHED", () => {
    test("shows info message, not-withdrawn heading, search results and Zurück button", async () => {
      renderWithState({
        withdrawResult: JSON.stringify({
          status: "NOT_PUBLISHED",
          documentNumber: "KORE500102022",
        }),
      })

      await nextTick()

      expect(screen.getByText("Nicht veröffentlicht")).toBeInTheDocument()
      expect(
        screen.getByText(
          "Das Dokument ist aktuell bereits nicht im Portal sichtbar.",
        ),
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          "Folgendes Dokument konnte nicht zurückgezogen werden:",
        ),
      ).toBeInTheDocument()
      expect(screen.getByText("KORE500102022")).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Zurück" })).toBeInTheDocument()

      expect(vi.mocked(searchCaselaw)).toHaveBeenCalledWith("KORE500102022")
    })
  })

  describe("status: NOT_FOUND", () => {
    test("shows warn message, not-withdrawn heading, search results and Zurück button", async () => {
      renderWithState({
        withdrawResult: JSON.stringify({
          status: "NOT_FOUND",
          documentNumber: "KORE500102022",
        }),
      })

      await nextTick()

      expect(screen.getByText("Nicht gefunden")).toBeInTheDocument()
      expect(
        screen.getByText("Das Dokument konnte nicht gefunden werden."),
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          "Folgendes Dokument konnte nicht zurückgezogen werden:",
        ),
      ).toBeInTheDocument()
      expect(screen.getByText("KORE500102022")).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Zurück" })).toBeInTheDocument()

      expect(vi.mocked(searchCaselaw)).toHaveBeenCalledWith("KORE500102022")
    })
  })

  test("shows fallback text with document number when search returns empty results", async () => {
    vi.mocked(searchCaselaw).mockResolvedValue([])
    renderWithState({
      withdrawResult: JSON.stringify({
        status: "WITHDRAWN",
        documentNumber: "KORE500102022",
      }),
    })

    expect(
      screen.getByText(/Das Dokument KORE500102022 konnte nicht gefunden/),
    ).toBeInTheDocument()
  })

  test("shows error text when searchCaselaw throws", async () => {
    vi.mocked(searchCaselaw).mockRejectedValue(new Error("Network error"))
    renderWithState({
      withdrawResult: JSON.stringify({
        status: "WITHDRAWN",
        documentNumber: "KORE500102022",
      }),
    })

    await waitFor(() => {
      expect(screen.getByText(/Network error/)).toBeInTheDocument()
    })
  })

  test("shows error message when withdrawResult has ERROR status", async () => {
    renderWithState({
      withdrawResult: JSON.stringify({
        status: "ERROR",
        documentNumber: "KORE500102022",
        detail: "Withdraw Error",
      }),
    })

    expect(router.currentRoute.value.name).toBe("withdraw-caselaw-result")
    expect(
      screen.getByText("Zurückziehen nicht erfolgreich."),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        "Das Dokument konnte nicht aus dem Portal entfernt werden: Withdraw Error",
      ),
    ).toBeInTheDocument()

    expect(
      screen.queryByText("Erfolgreich zurückgezogen."),
    ).not.toBeInTheDocument()
  })

  test("Zurück button calls router.back()", async () => {
    const backSpy = vi.spyOn(router, "back")
    const user = userEvent.setup()
    renderWithState({
      withdrawResult: JSON.stringify({
        status: "NOT_FOUND",
        documentNumber: "KORE500102022",
      }),
    })

    expect(screen.getByRole("button", { name: "Zurück" })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Zurück" }))
    expect(backSpy).toHaveBeenCalled()
  })
})

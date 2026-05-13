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
})

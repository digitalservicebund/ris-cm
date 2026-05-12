import { render, screen } from "@testing-library/vue"
import { test, expect, vi } from "vitest"
import ResultList from "@/components/ResultList.vue"
import { ref } from "vue"

vi.mock("@/lib/env", () => ({
  useEnv: () => ({
    env: ref({
      environment: "local" as const,
      portalBaseUrl: "https://portal.example.com",
    }),
  }),
}))

function renderComponent() {
  return render(ResultList)
}

test("zeigt Spaltenheader an", () => {
  renderComponent()

  expect(screen.getByText("Dokumentnummer")).toBeInTheDocument()
  expect(screen.getByText("Gericht")).toBeInTheDocument()
  expect(screen.getByText("Typ")).toBeInTheDocument()
  expect(screen.getByText("Entscheidungsdatum")).toBeInTheDocument()
  expect(screen.getByText("Aktenzeichen")).toBeInTheDocument()
  expect(screen.getByText("Sichtbar im Portal")).toBeInTheDocument()
})

test("zeigt statische Einträge an", () => {
  renderComponent()

  expect(screen.getByText("KORE123456789")).toBeInTheDocument()
  expect(screen.getByText("Bundesgerichtshof")).toBeInTheDocument()
  expect(screen.getByText("KVRE987654321")).toBeInTheDocument()
  expect(screen.getByText("Bundesverwaltungsgericht")).toBeInTheDocument()
  expect(screen.getByText("BSGE112233445")).toBeInTheDocument()
  expect(screen.getByText("Bundessozialgericht")).toBeInTheDocument()
})

test("zeigt Zurückziehen-Buttons an", () => {
  renderComponent()

  const buttons = screen.getAllByRole("button", { name: "Zurückziehen" })
  expect(buttons).toHaveLength(3)
})

test("zeigt Portal-Buttons an", () => {
  renderComponent()

  const links = screen.getAllByRole("link", { name: "Portal" })
  expect(links).toHaveLength(3)
})

test("verlinkt auf Portal-Seite der jeweiligen Dokumentnummer", () => {
  renderComponent()

  const links = screen.getAllByRole("link", { name: "Portal" })
  expect(links[0]).toHaveAttribute(
    "href",
    "https://portal.example.com/case-law/KORE123456789",
  )
  expect(links[1]).toHaveAttribute(
    "href",
    "https://portal.example.com/case-law/KVRE987654321",
  )
  expect(links[2]).toHaveAttribute(
    "href",
    "https://portal.example.com/case-law/BSGE112233445",
  )
})

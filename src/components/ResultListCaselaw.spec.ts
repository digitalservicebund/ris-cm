import { render, screen } from "@testing-library/vue"
import { test, expect, vi } from "vitest"
import ResultListCaselaw from "./ResultListCaselaw.vue"
import { ref } from "vue"
import type { CaselawDocument } from "@/lib/caselaw"

vi.mock("@/lib/env", () => ({
  useEnv: () => ({
    env: ref({
      environment: "local" as const,
      portalBaseUrl: "https://portal.example.com",
    }),
  }),
}))

const sampleEntries: CaselawDocument[] = [
  {
    documentNumber: "KORE123456789",
    court: "Bundesgerichtshof",
    typ: "Urteil",
    decisionDate: "15.03.2024",
    fileNumber: "VI ZR 12/23",
    visibleInPortal: true,
  },
  {
    documentNumber: "KVRE987654321",
    court: "Bundesverwaltungsgericht",
    typ: "Beschluss",
    decisionDate: "22.07.2023",
    fileNumber: "BVerwG 4 C 3.22",
    visibleInPortal: false,
  },
  {
    documentNumber: "BSGE112233445",
    court: "Bundessozialgericht",
    typ: "Urteil",
    decisionDate: "08.11.2023",
    fileNumber: "B 3 KR 7/22 R",
    visibleInPortal: true,
  },
]

function renderComponent() {
  return render(ResultListCaselaw, { props: { entries: sampleEntries } })
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

test("zeigt 'Starten Sie die Suche.' an, wenn entries undefined ist", () => {
  render(ResultListCaselaw, { props: { entries: undefined } })

  expect(screen.getByText("Starten Sie die Suche.")).toBeInTheDocument()
})

test("zeigt 'Starten Sie die Suche.' an, wenn entries leer ist", () => {
  render(ResultListCaselaw, { props: { entries: [] } })

  expect(screen.getByText("Starten Sie die Suche.")).toBeInTheDocument()
})

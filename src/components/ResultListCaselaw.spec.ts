import { render, screen, within } from "@testing-library/vue"
import { test, expect, vi } from "vitest"
import ResultListCaselaw from "./ResultListCaselaw.vue"
import { ref } from "vue"
import type { CaselawSearchResult } from "@/lib/caselaw"
import { userEvent } from "@testing-library/user-event"
import ConfirmationService from "primevue/confirmationservice"
import PrimeVue from "primevue/config"

vi.mock("@/lib/env", () => ({
  useEnv: () => ({
    env: ref({
      environment: "local" as const,
      portalBaseUrl: "https://portal.example.com",
    }),
  }),
}))

const sampleEntries: CaselawSearchResult[] = [
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
  return render(ResultListCaselaw, {
    props: { entries: sampleEntries },
    global: { plugins: [PrimeVue, ConfirmationService] },
  })
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
  render(ResultListCaselaw, {
    props: { entries: undefined },
    global: { plugins: [PrimeVue, ConfirmationService] },
  })

  expect(screen.getByText("Starten Sie die Suche.")).toBeInTheDocument()
})

test("zeigt 'Starten Sie die Suche.' an, wenn entries leer ist", () => {
  render(ResultListCaselaw, {
    props: { entries: [] },
    global: { plugins: [PrimeVue, ConfirmationService] },
  })

  expect(screen.getByText("Starten Sie die Suche.")).toBeInTheDocument()
})

test("öffnet Bestätigungsdialog beim Klick auf Zurückziehen", async () => {
  const user = userEvent.setup()
  renderComponent()

  await user.click(screen.getAllByRole("button", { name: "Zurückziehen" })[0])

  const dialog = screen.getByRole("alertdialog")
  expect(dialog).toBeInTheDocument()
  expect(
    within(dialog).getByText(
      "Sind Sie sicher, dass Sie dieses Dokument zurückziehen wollen?",
    ),
  ).toBeInTheDocument()
  expect(within(dialog).getByText("KORE123456789")).toBeInTheDocument()
  expect(
    within(dialog).getByText(/Das Dokument wird aus dem Portal entfernt/),
  ).toBeInTheDocument()
})

test("erzeugt withdraw-Event beim Bestätigen des Dialogs", async () => {
  const user = userEvent.setup()
  const { emitted } = renderComponent()

  await user.click(screen.getAllByRole("button", { name: "Zurückziehen" })[0])
  await user.click(
    screen.getByRole("button", { name: "Dokument zurückziehen" }),
  )

  expect(emitted("withdraw")).toBeTruthy()
  expect(emitted("withdraw")![0]).toEqual(["KORE123456789"])
})

test("schließt Dialog ohne Aktion beim Klick auf Abbrechen", async () => {
  const user = userEvent.setup()
  const { emitted } = renderComponent()

  await user.click(screen.getAllByRole("button", { name: "Zurückziehen" })[0])
  await user.click(screen.getByRole("button", { name: "Abbrechen" }))

  expect(emitted("withdraw")).toBeFalsy()
  expect(
    screen.queryByText(
      "Sind Sie sicher, dass Sie dieses Dokument zurückziehen wollen?",
    ),
  ).not.toBeInTheDocument()
})

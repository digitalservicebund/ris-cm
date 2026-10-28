import { render, screen, within } from "@testing-library/vue"
import { test, expect, vi } from "vitest"
import ResultListAdm from "./ResultListAdm.vue"
import { ref } from "vue"
import type { AdministrativeDirectiveSearchResult } from "@/lib/administrativeDirective"
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

const sampleEntries: AdministrativeDirectiveSearchResult[] = [
  {
    documentNumber: "KANR100001405",
    visibleInPortal: true,
  },
  {
    documentNumber: "KANR100001406",
    visibleInPortal: false,
  },
]

function renderComponent() {
  return render(ResultListAdm, {
    props: { entries: sampleEntries },
    global: { plugins: [PrimeVue, ConfirmationService] },
  })
}

test("zeigt Spaltenheader an", () => {
  renderComponent()

  expect(screen.getByText("Dokumentnummer")).toBeInTheDocument()
  expect(screen.getByText("Sichtbar im Portal")).toBeInTheDocument()
})

test("zeigt statische Einträge an", () => {
  renderComponent()

  expect(screen.getByText("KANR100001405")).toBeInTheDocument()
  expect(screen.getByText("KANR100001406")).toBeInTheDocument()
})

test("zeigt Zurückziehen-Buttons an", () => {
  renderComponent()

  const buttons = screen.getAllByRole("button", { name: "Zurückziehen" })
  expect(buttons).toHaveLength(2)
})

test("zeigt Portal-Buttons an", () => {
  renderComponent()

  const links = screen.getAllByRole("link", { name: "Portal" })
  expect(links).toHaveLength(2)
})

test("verlinkt auf Portal-Seite der jeweiligen Dokumentnummer", () => {
  renderComponent()

  const links = screen.getAllByRole("link", { name: "Portal" })
  expect(links[0]).toHaveAttribute(
    "href",
    "https://portal.example.com/verwaltungsvorschriften/KANR100001405",
  )
  expect(links[1]).toHaveAttribute(
    "href",
    "https://portal.example.com/verwaltungsvorschriften/KANR100001406",
  )
})

test("zeigt 'Starten Sie die Suche.' an, wenn entries undefined ist", () => {
  render(ResultListAdm, {
    props: { entries: undefined },
    global: { plugins: [PrimeVue, ConfirmationService] },
  })

  expect(screen.getByText("Starten Sie die Suche.")).toBeInTheDocument()
})

test("zeigt 'Starten Sie die Suche.' an, wenn entries leer ist", () => {
  render(ResultListAdm, {
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
  expect(within(dialog).getByText("KANR100001405")).toBeInTheDocument()
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
  expect(emitted("withdraw")[0]).toEqual(["KANR100001405"])
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

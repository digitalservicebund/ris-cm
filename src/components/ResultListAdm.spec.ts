import { render, screen, within } from "@testing-library/vue"
import { test, expect, vi } from "vitest"
import ResultListAdm from "./ResultListAdm.vue"
import { ref } from "vue"
import type { AdministrativeDirectiveSearchResult } from "@/lib/administrativeDirective"
import { userEvent } from "@testing-library/user-event"

// We use hidden: true for various elements within dialogs as jsdom does not evaluate
// command and commandfor attributes and therefor never displays the dialog.

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
  })
}

test("zeigt Spaltenheader an", () => {
  renderComponent()

  expect(screen.getByText("Dokumentnummer")).toBeInTheDocument()
  expect(screen.getByText("Sichtbar im Portal")).toBeInTheDocument()
})

test("zeigt statische Einträge an", () => {
  renderComponent()

  expect(screen.getAllByText("KANR100001405")).toBeTruthy()
  expect(screen.getAllByText("KANR100001406")).toBeTruthy()
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
    "https://portal.example.com/verwaltungsregelungen/KANR100001405",
  )
  expect(links[1]).toHaveAttribute(
    "href",
    "https://portal.example.com/verwaltungsregelungen/KANR100001406",
  )
})

test("zeigt 'Starten Sie die Suche.' an, wenn entries undefined ist", () => {
  render(ResultListAdm, {
    props: { entries: undefined },
  })

  expect(screen.getByText("Starten Sie die Suche.")).toBeInTheDocument()
})

test("zeigt 'Starten Sie die Suche.' an, wenn entries leer ist", () => {
  render(ResultListAdm, {
    props: { entries: [] },
  })

  expect(screen.getByText("Starten Sie die Suche.")).toBeInTheDocument()
})

test("öffnet Bestätigungsdialog beim Klick auf Zurückziehen", async () => {
  const user = userEvent.setup()
  renderComponent()

  await user.click(screen.getAllByRole("button", { name: "Zurückziehen" })[0])

  const dialog = screen
    .getAllByRole("alertdialog", { hidden: true })
    .find((candidate) => within(candidate).queryByText("KANR100001405"))!
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
  const dialog = screen
    .getAllByRole("alertdialog", { hidden: true })
    .find((candidate) => within(candidate).queryByText("KANR100001405"))!
  expect(dialog).toBeTruthy()

  await user.click(
    within(dialog).getByRole("button", {
      name: "Dokument zurückziehen",
      hidden: true,
    }),
  )

  expect(emitted("withdraw")).toBeTruthy()
  expect(emitted("withdraw")[0]).toEqual(["KANR100001405"])
})

test("schließt Dialog ohne Aktion beim Klick auf Abbrechen", async () => {
  const user = userEvent.setup()
  const { emitted } = renderComponent()

  await user.click(screen.getAllByRole("button", { name: "Zurückziehen" })[0])

  const dialog = screen
    .getAllByRole("alertdialog", { hidden: true })
    .find((candidate) => within(candidate).queryByText("KANR100001405"))!
  await user.click(
    within(dialog).getByRole("button", { name: "Abbrechen", hidden: true }),
  )

  expect(emitted("withdraw")).toBeFalsy()
})

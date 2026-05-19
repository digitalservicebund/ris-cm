import { render, screen } from "@testing-library/vue"
import { createRouter, createWebHistory } from "vue-router"
import SearchForm from "@/components/SearchForm.vue"
import { userEvent } from "@testing-library/user-event"
import { test, expect } from "vitest"

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/zurueckziehen",
      name: "withdraw",
      redirect: { name: "withdraw-caselaw" },
      children: [
        {
          path: "rechtsprechung",
          name: "withdraw-caselaw",
          components: {},
        },
        {
          path: "literatur",
          name: "withdraw-literature",
          components: {},
        },
        {
          path: "verwaltungsvorschriften",
          name: "withdraw-adm",
          components: {},
        },
      ],
    },
  ],
})

function renderComponent() {
  return {
    ...render(SearchForm, {
      global: {
        plugins: [router],
      },
    }),
  }
}

test("show header", async () => {
  renderComponent()

  expect(
    screen.getByText(
      "Welches Dokument wollen Sie zurückziehen? Wählen Sie die Dokumentart und geben Sie die Dokumentnummer ein, um das Dokument zu suchen.",
    ),
  ).toBeInTheDocument()
})

test("update navigation when inputting search params", async () => {
  renderComponent()
  const user = userEvent.setup()

  await user.click(screen.getByRole("radio", { name: "Literaturnachweise" }))
  expect(router.currentRoute.value.fullPath).toEqual("/zurueckziehen/literatur")

  await user.click(
    screen.getByRole("radio", { name: "Gerichtsentscheidungen" }),
  )
  expect(router.currentRoute.value.fullPath).toEqual(
    "/zurueckziehen/rechtsprechung",
  )

  await user.type(
    screen.getByRole("textbox", { name: "Dokumentnummer" }),
    "XXRE000714526",
  )
  expect(router.currentRoute.value.fullPath).toEqual(
    "/zurueckziehen/rechtsprechung?dokumentnummer=XXRE000714526",
  )

  await user.click(
    screen.getByRole("radio", { name: "Verwaltungsvorschriften" }),
  )
  expect(router.currentRoute.value.fullPath).toEqual(
    "/zurueckziehen/verwaltungsvorschriften?dokumentnummer=XXRE000714526",
  )
})

test("emits search event with document number when button is clicked", async () => {
  await router.push(
    "/zurueckziehen/rechtsprechung?dokumentnummer=KORE500102022",
  )
  const { emitted } = renderComponent()
  const user = userEvent.setup()

  await user.click(screen.getByRole("button", { name: "Suche starten" }))

  expect(emitted().search).toBeDefined()
  expect(emitted().search[0]).toEqual(["KORE500102022"])
})

test("emits search event with empty string when no document number is entered", async () => {
  await router.push("/zurueckziehen/rechtsprechung")
  const { emitted } = renderComponent()
  const user = userEvent.setup()

  await user.click(screen.getByRole("button", { name: "Suche starten" }))

  expect(emitted().search).toBeDefined()
  expect(emitted().search[0]).toEqual([""])
})

test("emits search event when pressing Enter in the document number input", async () => {
  await router.push("/zurueckziehen/rechtsprechung")
  const { emitted } = renderComponent()
  const user = userEvent.setup()

  await user.type(
    screen.getByRole("textbox", { name: "Dokumentnummer" }),
    "KORE500102022{Enter}",
  )

  expect(emitted().search).toBeDefined()
  expect(emitted().search[0]).toEqual(["KORE500102022"])
})

test("prefilling the inputs with the values from the route", async () => {
  await router.push("/zurueckziehen/literatur?dokumentnummer=XXRE000714526")

  renderComponent()

  expect(
    screen.getByRole("radio", { name: "Gerichtsentscheidungen" }),
  ).not.toBeChecked()
  expect(
    screen.getByRole("radio", { name: "Literaturnachweise" }),
  ).toBeChecked()
  expect(
    screen.getByRole("radio", { name: "Verwaltungsvorschriften" }),
  ).not.toBeChecked()

  expect(screen.getByRole("textbox", { name: "Dokumentnummer" })).toHaveValue(
    "XXRE000714526",
  )
})

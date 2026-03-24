import { render, screen } from "@testing-library/vue"
import { createTestingPinia } from "@pinia/testing"
import { createRouter, createWebHistory } from "vue-router"
import Navbar from "@/components/NavbarTop.vue"
import { userEvent } from "@testing-library/user-event"
import { test, expect } from "vitest"

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      name: "withdraw",
      path: "/withdraw",
      components: {},
    },
    {
      name: "uebersetzungen-normen",
      path: "/uebersetzungen-normen",
      components: {},
    },
  ],
})

function renderComponent() {
  return {
    ...render(Navbar, {
      global: {
        plugins: [
          router,
          createTestingPinia({
            initialState: {
              session: {
                user: { name: "test user" },
              },
            },
          }),
        ],
      },
    }),
  }
}

test("show header", async () => {
  renderComponent()

  expect(screen.getByText("Rechtsinformationen")).toBeInTheDocument()
  expect(screen.getByText("des Bundes")).toBeInTheDocument()
})

test("highlight link when it is clicked", async () => {
  const user = userEvent.setup()
  renderComponent()

  await user.click(screen.getByRole("link", { name: "Zurückziehen" }))

  expect(screen.getByRole("link", { name: "Zurückziehen" })).toHaveClass(
    "underline",
  )
  expect(
    screen.getByRole("link", { name: "Übersetzungen Normen" }),
  ).not.toHaveClass("underline")

  await user.click(screen.getByRole("link", { name: "Übersetzungen Normen" }))

  expect(screen.getByRole("link", { name: "Zurückziehen" })).not.toHaveClass(
    "underline",
  )
  expect(
    screen.getByRole("link", { name: "Übersetzungen Normen" }),
  ).toHaveClass("underline")
})

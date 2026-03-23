import { render, screen } from "@testing-library/vue"
import { createTestingPinia } from "@pinia/testing"
import { createRouter, createWebHistory } from "vue-router"
import Navbar from "@/components/NavbarTop.vue"

function renderComponent() {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      {
        name: "withdraw",
        components: {},
      },
      {
        name: "uebersetzungen-normen",
        components: {},
      },
    ],
  })

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

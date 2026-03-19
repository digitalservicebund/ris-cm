import type { RouteRecordRaw } from "vue-router"
import { createRouter, createWebHistory } from "vue-router"

const routes: readonly RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    redirect: { name: "Zurueckziehen" },
  },

  {
    path: "/zurueckziehen",
    name: "Home",
    redirect: { name: "Zurueckziehen" },
  },

  {
    path: "/zurueckziehen/rechtsprechung",
    children: [
      {
        path: "",
        name: "Zurueckziehen",
        component: () =>
          import("@/views/Withdraw.vue"),
      },
    ],
  },

  {
    path: "/uebersetzungenNormen",
    children: [
      {
        path: "",
        name: "UebersetzungenNormen",
        component: () =>
          import("@/views/TranslationsNorms.vue"),
      },
    ],
  },

  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/404/404NotFound.view.vue"),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router

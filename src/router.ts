import type { RouteRecordRaw } from "vue-router"
import { createRouter, createWebHistory } from "vue-router"

const routes: readonly RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    redirect: { name: "withdraw" },
  },
  {
    path: "/zurueckziehen",
    name: "withdraw",
    redirect: { name: "withdraw-caselaw" },
    children: [
      {
        path: "rechtsprechung",
        name: "withdraw-caselaw",
        component: () => import("@/views/Withdraw.vue"),
      },
      {
        path: "literatur",
        name: "withdraw-literature",
        component: () => import("@/views/Withdraw.vue"),
      },
      {
        path: "verwaltungsvorschriften",
        name: "withdraw-adm",
        component: () => import("@/views/Withdraw.vue"),
      },
    ],
  },

  {
    path: "/uebersetzungen-normen",
    children: [
      {
        path: "",
        name: "uebersetzungen-normen",
        component: () => import("@/views/TranslationsNorms.vue"),
      },
    ],
  },

  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("@/views/404NotFound.vue"),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router

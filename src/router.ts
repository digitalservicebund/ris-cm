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
        component: () => import("@/components/Withdraw.vue"),
      },
      {
        path: "literatur",
        name: "withdraw-literature",
        component: () => import("@/components/Withdraw.vue"),
      },
      {
        path: "verwaltungsvorschriften",
        name: "withdraw-adm",
        component: () => import("@/components/Withdraw.vue"),
      },
    ],
  },

  {
    path: "/uebersetzungen-normen",
    children: [
      {
        path: "",
        name: "uebersetzungen-normen",
        component: () => import("@/components/TranslationsNorms.vue"),
      },
    ],
  },

  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("@/components/404/404NotFound.vue"),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router

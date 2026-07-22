import type { RouteRecordRaw } from "vue-router"
import { createRouter, createWebHistory } from "vue-router"
import WithdrawCaselaw from "@/views/WithdrawCaselaw.vue"
import Withdraw from "@/views/Withdraw.vue"
import WithdrawCaselawResult from "@/views/WithdrawCaselawResult.vue"
import TranslationsNorms from "@/views/TranslationsNorms.vue"
import NotFound from "@/views/404NotFound.vue"

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
        component: WithdrawCaselaw,
      },
      {
        path: "rechtsprechung/ergebnis",
        name: "withdraw-caselaw-result",
        component: WithdrawCaselawResult,
      },
      {
        path: "literatur",
        name: "withdraw-literature",
        component: Withdraw,
      },
      {
        path: "verwaltungsvorschriften",
        name: "withdraw-adm",
        component: Withdraw,
      },
    ],
  },

  {
    path: "/uebersetzungen-normen",
    children: [
      {
        path: "",
        name: "uebersetzungen-normen",
        component: TranslationsNorms,
      },
    ],
  },

  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: NotFound,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router

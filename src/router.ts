import type { RouteRecordRaw } from "vue-router"
import { createRouter, createWebHistory } from "vue-router"
import WithdrawCaselaw from "@/views/WithdrawCaselaw.vue"
import WithdrawCaselawResult from "@/views/WithdrawCaselawResult.vue"
import TranslationsNorms from "@/views/TranslationsNorms.vue"
import NotFound from "@/views/404NotFound.vue"
import WithdrawAdm from "@/views/WithdrawAdm.vue"
import WithdrawAdmResult from "@/views/WithdrawAdmResult.vue"

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
        path: "verwaltungsvorschriften",
        name: "withdraw-adm",
        component: WithdrawAdm,
      },
      {
        path: "verwaltungsvorschriften/ergebnis",
        name: "withdraw-adm-result",
        component: WithdrawAdmResult,
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

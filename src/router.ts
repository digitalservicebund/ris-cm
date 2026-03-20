import type { RouteRecordRaw } from "vue-router"
import { createRouter, createWebHistory } from "vue-router"

const routes: readonly RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    redirect: { name: "Withdraw" },
  },

  {
    path: "/zurueckziehen",
    children: [
      {
        path: "",
        name: "Withdraw",
        component: () => import("@/components/Withdraw.vue"),
      },
    ],
  },

  {
    path: "/uebersetzungenNormen",
    children: [
      {
        path: "",
        name: "UebersetzungenNormen",
        component: () => import("@/components/TranslationsNorms.vue"),
      },
    ],
  },

  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/components/404/404NotFound.vue"),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router

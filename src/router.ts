import type { RouteRecordRaw } from "vue-router"
import { createRouter, createWebHistory } from "vue-router"

const routes: readonly RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    redirect: { name: "Rechtsprechung" },
  },

  {
    path: `/rechtsprechung`,
    children: [
      {
        path: "",
        name: "Rechtsprechung",
        component: () =>
          import("@/views/rechtsprechung/Rechtsprechung.view.vue"),
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

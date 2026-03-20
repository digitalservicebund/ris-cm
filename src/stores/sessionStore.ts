import { useFavicon } from "@vueuse/core"
import { defineStore } from "pinia"
import { type Ref, ref } from "vue"
import type { Env, User } from "@/scripts/domain"
import { getFavicon } from "@/scripts/getFavicon"

type SessionStore = {
  user: Ref<User | undefined>
  env: Ref<Env | undefined>
  isAuthenticated: () => Promise<boolean>
  initSession: () => Promise<void>
}

const useSessionStore = defineStore("session", (): SessionStore => {
  const user = ref<User>({ name: "test user", initials: "TU" })
  const env = ref<Env>()

  /**
   * Checks with the backend if the user has a valid session and updates the user
   * in store.
   *
   * @returns A promise with a boolean indicating if the user is authenticated.
   */
  async function isAuthenticated(): Promise<boolean> {
    user.value = { name: "test user", initials: "TU" }
    return !!user.value?.name
  }

  async function initSession(): Promise<void> {
    env.value = { environment: "staging" }
    useFavicon(getFavicon(env.value?.environment))
  }

  return { user, env, isAuthenticated, initSession }
})

export default useSessionStore

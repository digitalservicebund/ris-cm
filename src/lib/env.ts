import type { BrowserOptions } from "@sentry/vue"
import { ref } from "vue"

export type Env = {
  auth?: {
    url: string
    clientId: string
    realm: string
  }
  environment: "local" | "staging" | "uat" | "production"
  portalBaseUrl: string
  caselawSearchUrl: string
  caselawWithdrawUrl: string
  portalBasicAuth?: boolean
  sentry?: BrowserOptions
}

let envCache: Promise<Env> | undefined
export const getEnv: () => Promise<Env> = () => {
  envCache ??= fetch("/config/env.json")
    .then((response) => response.json())
    .then((env) => {
      if (!env.environment) {
        throw new Error("Missing required config field: environment")
      }
      if (!env.portalBaseUrl) {
        throw new Error("Missing required config field: portalBaseUrl")
      }
      if (!env.caselawSearchUrl) {
        throw new Error("Missing required config field: caselawSearchUrl")
      }
      if (!env.caselawWithdrawUrl) {
        throw new Error("Missing required config field: caselawWithdrawUrl")
      }
      return env as Env
    })
    .catch((error) => {
      envCache = undefined
      throw error
    })

  return envCache
}

export function useEnv() {
  const env = ref<Env | undefined>(undefined)

  getEnv().then((resolved) => {
    env.value = resolved
  })

  return { env }
}

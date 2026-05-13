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
  sentry?: BrowserOptions
}

let envCache: Promise<Env> | undefined
export const getEnv: () => Promise<Env> = async () => {
  if (envCache) {
    return envCache
  }

  const response = await fetch("/config/env.json")
  const env = await response.json()

  if (!env.environment) {
    throw new Error("Missing required config field: environment")
  }
  if (!env.portalBaseUrl) {
    throw new Error("Missing required config field: portalBaseUrl")
  }
  if (!env.caselawSearchUrl) {
    throw new Error("Missing required config field: caselawSearchUrl")
  }

  envCache = env

  return env
}

export function useEnv() {
  const env = ref<Env | undefined>(undefined)

  getEnv().then((resolved) => {
    env.value = resolved
  })

  return { env }
}

import type { BrowserOptions } from "@sentry/vue"
import { ref } from "vue"

export type Env = {
  auth?: {
    url: string
    clientId: string
    realm: string
  }
  environment: "local" | "staging" | "uat" | "production"
  portalBaseUrl?: string
  caselawSearchUrl?: string
  sentry?: BrowserOptions
}

let envCache: Promise<Env> | undefined
export const getEnv: () => Promise<Env> = () => {
  envCache ??= fetch("/config/env.json").then((response) => response.json())
  return envCache
}

export function useEnv() {
  const env = ref<Env | undefined>(undefined)

  getEnv().then((resolved) => {
    env.value = resolved
  })

  return { env }
}

import type { BrowserOptions } from "@sentry/vue"

export type Env = {
  auth?: {
    url: string
    clientId: string
    realm: string
  }
  environment: "local" | "staging" | "uat" | "production"
  sentry?: BrowserOptions
}

export const getEnv: () => Promise<Env> = async () => {
  const response = await fetch("/config/env.json")
  const data: Env = await response.json()
  return data
}

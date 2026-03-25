export type Env = {
  auth?: {
    url: string
    clientId: string
    realm: string
  }
  environment: "local" | "staging" | "uat" | "production"
}

export const getEnv: () => Promise<Env> = async () => {
  const response = await fetch("/env.json")
  const data: Env = await response.json()
  return data
}

export type Environment = "staging" | "uat" | "production"

export type Env = { environment: Environment; portalUrl?: string }

export type User = {
  id?: string
  name: string
  documentationOffice?: {
    abbreviation: string
  }
  email?: string
  internal?: boolean
  initials: string
}

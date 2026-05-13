import { getEnv } from "@/lib/env"

export interface CaselawDocument {
  documentNumber: string
  court: string
  typ: string
  decisionDate: string
  fileNumber: string
  visibleInPortal: boolean
}

export async function searchCaselaw(
  documentNumber: string,
): Promise<CaselawDocument[]> {
  const env = await getEnv()
  if (!env.caselawSearchUrl) {
    throw new Error("caselawSearchUrl is not configured")
  }

  const response = await fetch(
    `${env.caselawSearchUrl}?document-number=${encodeURIComponent(documentNumber)}`,
  )

  if (!response.ok) {
    throw new Error(`Search failed: ${response.status}`)
  }

  return response.json()
}

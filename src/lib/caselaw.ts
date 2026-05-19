import { useAuthentication } from "@/lib/auth"
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

  const auth = useAuthentication()
  await auth.tryRefresh()

  const response = await fetch(
    `${env.caselawSearchUrl}?document-number=${encodeURIComponent(documentNumber)}`,
    { headers: auth.addAuthorizationHeader() },
  )

  if (response.status === 404) {
    return []
  }

  if (!response.ok) {
    throw new Error(`Search failed: ${response.status}`)
  }

  const result: CaselawDocument = await response.json()
  return [result]
}

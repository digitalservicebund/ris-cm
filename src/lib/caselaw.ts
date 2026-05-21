import { useAuthentication } from "@/lib/auth"
import { getEnv } from "@/lib/env"

export interface CaselawDocument {
  documentNumber: string
  court: string
  typ: string
  decisionDate: string
  fileNumber: string
}

interface PortalApiResponse {
  documentNumber?: string
  courtName?: string
  documentType?: string
  decisionDate?: string
  fileNumbers?: string[]
}

async function fetchFromCaselawBackendApi(
  documentNumber: string,
): Promise<CaselawDocument | null> {
  const env = await getEnv()
  const auth = useAuthentication()
  await auth.tryRefresh()

  const response = await fetch(
    `${env.caselawSearchUrl}?document-number=${encodeURIComponent(documentNumber)}`,
    { headers: auth.addAuthorizationHeader() },
  )

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(`Search failed: ${response.status}`)
  }

  return response.json()
}

async function fetchFromPortalApi(
  documentNumber: string,
): Promise<CaselawDocument | null> {
  const env = await getEnv()
  try {
    const response = await fetch(
      `${env.portalBaseUrl}/v1/case-law/${encodeURIComponent(documentNumber)}`,
    )

    if (!response.ok) {
      return null
    }

    const result: PortalApiResponse = await response.json()

    return {
      documentNumber: result.documentNumber ?? documentNumber,
      court: result.courtName ?? "",
      typ: result.documentType ?? "",
      decisionDate: result.decisionDate ?? "",
      fileNumber: result.fileNumbers?.[0] ?? "",
    }
  } catch {
    return null
  }
}

export async function searchCaselaw(
  documentNumber: string,
): Promise<(CaselawDocument & { visibleInPortal: boolean })[]> {
  const [caselawBackendResult, portalResult] = await Promise.all([
    fetchFromCaselawBackendApi(documentNumber),
    fetchFromPortalApi(documentNumber),
  ])

  if (caselawBackendResult == null && portalResult == null) {
    return []
  }

  return [
    {
      ...caselawBackendResult!,
      ...portalResult!, // trick typescript into not forgetting that at least one of the two results exists
      visibleInPortal: portalResult != null,
    },
  ]
}

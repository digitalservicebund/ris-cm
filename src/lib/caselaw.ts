import { useAuthentication } from "@/lib/auth"
import { fetchWithBasicAuth } from "@/lib/basicAuth"
import { getEnv } from "@/lib/env"
import type { WithdrawResult } from "@/lib/useWithdraw"

interface CaselawDocument {
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

export type CaselawSearchResult = CaselawDocument & {
  /**
   * Could the document be found using the portal api?
   */
  visibleInPortal: boolean
}

async function fetchFromCaselawBackendApi(
  documentNumber: string,
): Promise<CaselawDocument | null> {
  const env = await getEnv()
  const auth = useAuthentication()
  await auth.tryRefresh()

  try {
    const response = await fetch(
      `${env.caselawSearchUrl}?document-number=${encodeURIComponent(documentNumber)}`,
      { headers: auth.addAuthorizationHeader() },
    )

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error(`Search failed (caselaw backend): ${response.status}`)
    }

    return response.json()
  } catch (error) {
    throw new Error(`Search failed (caselaw backend): ${error}`, {
      cause: error,
    })
  }
}

async function fetchFromPortalApi(
  documentNumber: string,
): Promise<CaselawDocument | null> {
  const env = await getEnv()
  const url = `${env.portalBaseUrl}/v1/case-law/${encodeURIComponent(documentNumber)}`

  try {
    const response = env.portalBasicAuth
      ? await fetchWithBasicAuth(url, undefined)
      : await fetch(url)
    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error(`Search failed (portal): ${response.status}`)
    }

    const result: PortalApiResponse = await response.json()

    return {
      documentNumber: result.documentNumber ?? documentNumber,
      court: result.courtName ?? "",
      typ: result.documentType ?? "",
      decisionDate: result.decisionDate ?? "",
      fileNumber: result.fileNumbers?.[0] ?? "",
    }
  } catch (error) {
    throw new Error(`Search failed (caselaw backend): ${error}`, {
      cause: error,
    })
  }
}

export async function search(
  documentNumber: string,
): Promise<CaselawSearchResult[]> {
  const [caselawBackendResult, portalResult] = await Promise.all([
    fetchFromCaselawBackendApi(documentNumber),
    fetchFromPortalApi(documentNumber),
  ])

  if (caselawBackendResult == null && portalResult == null) {
    return []
  }

  return [
    {
      ...({
        ...portalResult,
        ...caselawBackendResult,
      } as CaselawDocument),
      visibleInPortal: portalResult != null,
    },
  ]
}

export async function withdraw(
  documentNumber: string,
): Promise<WithdrawResult> {
  const env = await getEnv()
  const auth = useAuthentication()
  await auth.tryRefresh()

  try {
    const response = await fetch(env.caselawWithdrawUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        ...auth.addAuthorizationHeader(),
      },
      body: documentNumber,
    })

    if (!response.ok) {
      const body = await response.json()
      return {
        status: "ERROR",
        documentNumber,
        detail: body.detail,
      }
    }

    return (await response.json()) as WithdrawResult
  } catch (error) {
    return {
      status: "ERROR",
      documentNumber,
      detail: error instanceof Error ? error.message : error?.toString(),
    }
  }
}

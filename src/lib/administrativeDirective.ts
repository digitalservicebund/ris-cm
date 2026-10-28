import { useAuthentication } from "@/lib/auth"
import { fetchWithBasicAuth } from "@/lib/basicAuth"
import { getEnv } from "@/lib/env"
import type { WithdrawResult } from "@/lib/useWithdraw"

interface AdministrativeDirectiveDocument {
  documentNumber: string
}

interface PortalApiResponse {
  documentNumber?: string
}

export type AdministrativeDirectiveSearchResult =
  AdministrativeDirectiveDocument & {
    /**
     * Could the document be found using the portal api?
     */
    visibleInPortal: boolean
  }

async function fetchFromAdmVVBundBackendApi(
  documentNumber: string,
): Promise<AdministrativeDirectiveDocument | null> {
  const env = await getEnv()
  const auth = useAuthentication()
  await auth.tryRefresh()

  try {
    const response = await fetch(
      `${env.admVVBundSearchUrl}?document-number=${encodeURIComponent(documentNumber)}`,
      { headers: auth.addAuthorizationHeader() },
    )

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error(`Search failed (adm vv-bund backend): ${response.status}`)
    }

    return response.json()
  } catch (error) {
    throw new Error(`Search failed (adm vv-bund backend): ${error}`, {
      cause: error,
    })
  }
}

async function fetchFromPortalApi(
  documentNumber: string,
): Promise<AdministrativeDirectiveDocument | null> {
  const env = await getEnv()
  const jsonUrl = `${env.portalBaseUrl}/v1/administrative-directive/${encodeURIComponent(documentNumber)}`
  const xmlUrl = `${env.portalBaseUrl}/v1/administrative-directive/${encodeURIComponent(documentNumber)}.xml`

  try {
    // the json endpoint is cached for a bit so we need to check the xml to know if a document is still available
    const xmlResponse = env.portalBasicAuth
      ? await fetchWithBasicAuth(xmlUrl)
      : await fetch(xmlUrl)
    if (xmlResponse.status === 404) {
      return null
    }

    const response = env.portalBasicAuth
      ? await fetchWithBasicAuth(jsonUrl)
      : await fetch(jsonUrl)
    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error(`Search failed (portal): ${response.status}`)
    }

    const result: PortalApiResponse = await response.json()

    return {
      documentNumber: result.documentNumber ?? documentNumber,
    }
  } catch (error) {
    throw new Error(`Search failed (portal): ${error}`, {
      cause: error,
    })
  }
}

export async function search(
  documentNumber: string,
): Promise<AdministrativeDirectiveSearchResult[]> {
  const [backendResult, portalResult] = await Promise.all([
    fetchFromAdmVVBundBackendApi(documentNumber),
    fetchFromPortalApi(documentNumber),
  ])

  if (backendResult == null && portalResult == null) {
    return []
  }

  return [
    {
      ...({
        ...portalResult,
        ...backendResult,
      } as AdministrativeDirectiveDocument),
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
    const response = await fetch(env.admVVBundWithdrawUrl, {
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

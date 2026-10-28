import { describe, test, expect, vi, beforeEach } from "vitest"
import { search, withdraw } from "@/lib/administrativeDirective"
import type { Env } from "@/lib/env"
import type { WithdrawResult } from "@/lib/useWithdraw"

const mockGetEnv = vi.fn<() => Promise<Env>>().mockResolvedValue({
  environment: "local",
  portalBaseUrl: "https://portal.example.com",
  caselawSearchUrl: "https://example.com/api/v1/search",
  caselawWithdrawUrl: "https://example.com/api/v1/withdraw",
  admVVBundSearchUrl: "https://example.com/api/v1/adm-search",
  admVVBundWithdrawUrl: "https://example.com/api/v1/adm-withdraw",
})

vi.mock("@/lib/env", () => ({
  getEnv: () => mockGetEnv(),
}))

const mockFetchWithBasicAuth =
  vi.fn<(url: RequestInfo | URL, init?: RequestInit) => Promise<Response>>()
vi.mock("@/lib/basicAuth", () => ({
  fetchWithBasicAuth: (
    url: RequestInfo | URL,
    init?: RequestInit | undefined,
  ) => mockFetchWithBasicAuth(url, init),
}))

const searchResult = {
  documentNumber: "KANR100001405",
}

const portalResult = {
  documentNumber: "KANR100001405",
}

describe("search", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
    mockGetEnv.mockResolvedValue({
      environment: "local",
      portalBaseUrl: "https://portal.example.com",
      caselawSearchUrl: "https://example.com/api/v1/search",
      caselawWithdrawUrl: "https://example.com/api/v1/withdraw",
      admVVBundSearchUrl: "https://example.com/api/v1/adm-search",
      admVVBundWithdrawUrl: "https://example.com/api/v1/adm-withdraw",
    })
    mockFetchWithBasicAuth.mockReset()
  })

  test("calls the search URL and portal URL with the document number", async () => {
    vi.mocked(fetch).mockImplementation((url) => {
      if (String(url).includes("portal.example.com")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(portalResult),
        } as Response)
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(searchResult),
      } as Response)
    })

    const results = await search("KANR100001405")

    expect(fetch).toHaveBeenCalledWith(
      "https://example.com/api/v1/adm-search?document-number=KANR100001405",
      expect.anything(),
    )
    expect(fetch).toHaveBeenCalledWith(
      "https://portal.example.com/v1/administrative-directive/KANR100001405",
    )
    expect(results[0].visibleInPortal).toBe(true)
  })

  test("sets visibleInPortal to false when portal returns 404", async () => {
    vi.mocked(fetch).mockImplementation((url) => {
      if (String(url).includes("portal.example.com")) {
        return Promise.resolve({ ok: false, status: 404 } as Response)
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(searchResult),
      } as Response)
    })

    const results = await search("KANR100001405")
    expect(results[0].visibleInPortal).toBe(false)
  })

  test("uses fields from portal when search result is missing", async () => {
    vi.mocked(fetch).mockImplementation((url) => {
      if (String(url).includes("portal.example.com")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(portalResult),
        } as Response)
      }
      return Promise.resolve({ ok: false, status: 404 } as Response)
    })

    const results = await search("KANR100001405")
    expect(results[0].documentNumber).toBe("KANR100001405")
    expect(results[0].visibleInPortal).toBe(true)
  })

  test("returns empty array when both responses are 404", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
    } as Response)

    const results = await search("KANR100001405")
    expect(results).toEqual([])
  })

  test("throws when search response is not ok (non-404)", async () => {
    vi.mocked(fetch).mockImplementation((url) => {
      if (String(url).includes("portal.example.com")) {
        return Promise.resolve({ ok: false, status: 404 } as Response)
      }
      return Promise.resolve({ ok: false, status: 500 } as Response)
    })

    await expect(search("KANR100001405")).rejects.toThrow(
      "Search failed (adm vv-bund backend): 500",
    )
  })

  test("throws when portal response is not ok (non-404)", async () => {
    vi.mocked(fetch).mockImplementation((url) => {
      if (String(url).includes("portal.example.com")) {
        return Promise.resolve({ ok: false, status: 500 } as Response)
      }
      return Promise.resolve({ ok: false, status: 404 } as Response)
    })

    await expect(search("KANR100001405")).rejects.toThrow(
      "Search failed (portal): 500",
    )
  })

  test("uses fetchWithBasicAuth for the portal request when portalBasicAuth is enabled", async () => {
    mockGetEnv.mockResolvedValue({
      environment: "local",
      portalBaseUrl: "https://portal.example.com",
      caselawSearchUrl: "https://example.com/api/v1/search",
      caselawWithdrawUrl: "https://example.com/api/v1/withdraw",
      admVVBundSearchUrl: "https://example.com/api/v1/adm-search",
      admVVBundWithdrawUrl: "https://example.com/api/v1/adm-withdraw",
      portalBasicAuth: true,
    })
    mockFetchWithBasicAuth.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(portalResult),
    } as Response)
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(searchResult),
    } as Response)

    const results = await search("KANR100001405")

    expect(mockFetchWithBasicAuth).toHaveBeenCalledWith(
      "https://portal.example.com/v1/administrative-directive/KANR100001405",
      undefined,
    )
    expect(results[0].visibleInPortal).toBe(true)
  })
})

describe("withdraw", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
  })

  test("POSTs to the withdraw URL with document number in body", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          status: "WITHDRAWN",
          documentNumber: "KANR100001405",
        }),
    } as unknown as Response)

    const result = (await withdraw("KANR100001405")) as WithdrawResult

    expect(fetch).toHaveBeenCalledWith(
      "https://example.com/api/v1/adm-withdraw",
      expect.objectContaining({
        method: "POST",
        body: "KANR100001405",
      }),
    )
    expect(result.status).toEqual("WITHDRAWN")
    expect(result.documentNumber).toEqual("KANR100001405")
  })

  test("returns WithdrawResult with ERROR status and RFC-9457 detail when an error happens", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: () =>
        Promise.resolve({
          status: 500,
          detail: "Withdraw error.",
        }),
    } as unknown as Response)

    const result = await withdraw("KANR100001405")
    expect(result).toEqual({
      status: "ERROR",
      documentNumber: "KANR100001405",
      detail: "Withdraw error.",
    })
  })
})

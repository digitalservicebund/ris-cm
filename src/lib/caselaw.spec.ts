import { describe, test, expect, vi, beforeEach } from "vitest"
import { searchCaselaw, withdrawDocument } from "@/lib/caselaw"
import type { Env } from "@/lib/env"
import type { WithdrawResult } from "@/lib/useWithdraw"

vi.mock("@/lib/env", () => ({
  getEnv: vi.fn<() => Promise<Env>>().mockResolvedValue({
    environment: "local",
    portalBaseUrl: "https://portal.example.com",
    caselawSearchUrl: "https://example.com/api/v1/search",
    caselawWithdrawUrl: "https://example.com/api/v1/withdraw",
  }),
}))

const searchResult = {
  documentNumber: "KORE500102022",
  court: "BGH",
  typ: "Urteil",
  decisionDate: "2022-01-01",
  fileNumber: "IX ZR 1/22",
  visibleInPortal: false,
}

const portalResult = {
  documentNumber: "KORE500102022",
  courtName: "BGH Karlsruhe",
  documentType: "Urteil",
  decisionDate: "2022-01-01",
  fileNumbers: ["IX ZR 1/22"],
}

describe("searchCaselaw", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
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

    const results = await searchCaselaw("KORE500102022")

    expect(fetch).toHaveBeenCalledWith(
      "https://example.com/api/v1/search?document-number=KORE500102022",
      expect.anything(),
    )
    expect(fetch).toHaveBeenCalledWith(
      "https://portal.example.com/v1/case-law/KORE500102022",
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

    const results = await searchCaselaw("KORE500102022")
    expect(results[0].visibleInPortal).toBe(false)
  })

  test("uses fields from portal when search result is missing them", async () => {
    const partialSearchResult = {
      documentNumber: "KORE500102022",
      court: "",
      typ: "",
      decisionDate: "",
      fileNumber: "",
      visibleInPortal: false,
    }
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
        json: () => Promise.resolve(partialSearchResult),
      } as Response)
    })

    const results = await searchCaselaw("KORE500102022")
    expect(results[0].court).toBe("BGH Karlsruhe")
    expect(results[0].fileNumber).toBe("IX ZR 1/22")
    expect(results[0].visibleInPortal).toBe(true)
  })

  test("returns empty array when both responses are 404", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
    } as Response)

    const results = await searchCaselaw("KORE500102022")
    expect(results).toEqual([])
  })

  test("throws when search response is not ok (non-404)", async () => {
    vi.mocked(fetch).mockImplementation((url) => {
      if (String(url).includes("portal.example.com")) {
        return Promise.resolve({ ok: false, status: 404 } as Response)
      }
      return Promise.resolve({ ok: false, status: 500 } as Response)
    })

    await expect(searchCaselaw("KORE500102022")).rejects.toThrow(
      "Search failed (caselaw backend): 500",
    )
  })

  test("throws when portal response is not ok (non-404)", async () => {
    vi.mocked(fetch).mockImplementation((url) => {
      if (String(url).includes("portal.example.com")) {
        return Promise.resolve({ ok: false, status: 500 } as Response)
      }
      return Promise.resolve({ ok: false, status: 404 } as Response)
    })

    await expect(searchCaselaw("KORE500102022")).rejects.toThrow(
      "Search failed (portal): 500",
    )
  })
})

describe("withdrawDocument", () => {
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
          documentNumber: "KORE500102022",
        }),
    } as unknown as Response)

    const result = (await withdrawDocument("KORE500102022")) as WithdrawResult

    expect(fetch).toHaveBeenCalledWith(
      "https://example.com/api/v1/withdraw",
      expect.objectContaining({
        method: "POST",
        body: "KORE500102022",
      }),
    )
    expect(result.status).toEqual("WITHDRAWN")
    expect(result.documentNumber).toEqual("KORE500102022")
  })

  test("returns WithdrawError when response is not ok", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    } as unknown as Response)

    const result = await withdrawDocument("KORE500102022")
    expect(result).toEqual({ error: true })
  })

  test("returns WithdrawError with RFC-9457 detail when response body contains detail", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: () =>
        Promise.resolve({
          status: 500,
          detail: "Withdraw error.",
        }),
    } as unknown as Response)

    const result = await withdrawDocument("KORE500102022")
    expect(result).toEqual({
      error: true,
      detail: "Withdraw error.",
      status: 500,
    })
  })
})

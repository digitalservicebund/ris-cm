import { describe, test, expect, vi, beforeEach } from "vitest"
import { searchCaselaw } from "@/lib/caselaw"
import type { Env } from "@/lib/env"

vi.mock("@/lib/env", () => ({
  getEnv: vi.fn<() => Promise<Env>>().mockResolvedValue({
    environment: "local",
    portalBaseUrl: "https://example.com",
    caselawSearchUrl: "https://example.com/api/v1/search",
  }),
}))

describe("searchCaselaw", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
  })

  test("calls the correct URL with the document number", async () => {
    const mockResult = {
      documentNumber: "KORE500102022",
      court: "BGH",
      typ: "Urteil",
      decisionDate: "2022-01-01",
      fileNumber: "IX ZR 1/22",
      visibleInPortal: true,
    }
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockResult),
    } as Response)

    const results = await searchCaselaw("KORE500102022")

    expect(fetch).toHaveBeenCalledWith(
      "https://example.com/api/v1/search?document-number=KORE500102022",
      expect.anything(),
    )
    expect(results).toEqual([mockResult])
  })

  test("returns empty array when response is 404", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
    } as Response)

    const results = await searchCaselaw("KORE500102022")
    expect(results).toEqual([])
  })

  test("throws when response is not ok", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
    } as Response)

    await expect(searchCaselaw("KORE500102022")).rejects.toThrow(
      "Search failed: 500",
    )
  })
})

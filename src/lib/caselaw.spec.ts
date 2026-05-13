import { describe, test, expect, vi, beforeEach } from "vitest"
import { searchCaselaw } from "@/lib/caselaw"
import type { Env } from "@/lib/env"

vi.mock("@/lib/env", () => ({
  getEnv: vi.fn<() => Promise<Env>>().mockResolvedValue({
    environment: "local",
    caselawSearchUrl: "https://example.com/api/v1/search",
  }),
}))

describe("searchCaselaw", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
  })

  test("calls the correct URL with the document number", async () => {
    const mockResults = [
      {
        documentNumber: "KORE500102022",
        court: "BGH",
        typ: "Urteil",
        decisionDate: "2022-01-01",
        fileNumber: "IX ZR 1/22",
        visibleInPortal: true,
      },
    ]
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResults),
    } as Response)

    const results = await searchCaselaw("KORE500102022")

    expect(fetch).toHaveBeenCalledWith(
      "https://example.com/api/v1/search?document-number=KORE500102022",
    )
    expect(results).toEqual(mockResults)
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

  test("throws when caselawSearchUrl is not configured", async () => {
    const { getEnv } = await import("@/lib/env")
    vi.mocked(getEnv).mockResolvedValueOnce({
      environment: "local",
    })

    await expect(searchCaselaw("KORE500102022")).rejects.toThrow(
      "caselawSearchUrl is not configured",
    )
  })
})

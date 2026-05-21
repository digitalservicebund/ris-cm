import { beforeEach, describe, expect, test, vi } from "vitest"
import type { Env } from "@/lib/env"

beforeEach(() => {
  // Reset module registry between tests so envCache is cleared
  vi.resetModules()
})

function mockFetch(data: Partial<Env>) {
  vi.stubGlobal(
    "fetch",
    vi
      .fn<() => Promise<{ ok: boolean; json: () => Promise<unknown> }>>()
      .mockResolvedValue({
        ok: true,
        json: vi.fn<() => Promise<unknown>>().mockResolvedValue(data),
      }),
  )
}

const validEnv: Env = {
  environment: "local" as const,
  portalBaseUrl: "https://portal.example.com",
  caselawSearchUrl: "https://search.example.com",
  caselawWithdrawUrl: "https://withdraw.example.com",
}

describe("getEnv", () => {
  test("returns parsed env when all required fields are present", async () => {
    mockFetch(validEnv)
    const { getEnv } = await import("@/lib/env")
    const env = await getEnv()
    expect(env).toEqual(validEnv)
  })

  test("throws when environment field is missing", async () => {
    mockFetch({
      portalBaseUrl: "https://portal.example.com",
      caselawSearchUrl: "https://search.example.com",
    })
    const { getEnv } = await import("@/lib/env")
    await expect(getEnv()).rejects.toThrow(
      "Missing required config field: environment",
    )
  })

  test("throws when portalBaseUrl field is missing", async () => {
    mockFetch({
      environment: "local",
      caselawSearchUrl: "https://search.example.com",
    })
    const { getEnv } = await import("@/lib/env")
    await expect(getEnv()).rejects.toThrow(
      "Missing required config field: portalBaseUrl",
    )
  })

  test("throws when caselawSearchUrl field is missing", async () => {
    mockFetch({
      environment: "local",
      portalBaseUrl: "https://portal.example.com",
    })
    const { getEnv } = await import("@/lib/env")
    await expect(getEnv()).rejects.toThrow(
      "Missing required config field: caselawSearchUrl",
    )
  })

  test("throws when caselawWithdrawUrl field is missing", async () => {
    mockFetch({
      environment: "local",
      portalBaseUrl: "https://portal.example.com",
      caselawSearchUrl: "https://search.example.com",
    })
    const { getEnv } = await import("@/lib/env")
    await expect(getEnv()).rejects.toThrow(
      "Missing required config field: caselawWithdrawUrl",
    )
  })

  test("caches the result and only fetches once", async () => {
    const fetchMock = vi
      .fn<() => Promise<{ ok: boolean; json: () => Promise<unknown> }>>()
      .mockResolvedValue({
        ok: true,
        json: vi.fn<() => Promise<unknown>>().mockResolvedValue(validEnv),
      })
    vi.stubGlobal("fetch", fetchMock)
    const { getEnv } = await import("@/lib/env")
    await getEnv()
    await getEnv()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import {
  clearCredentials,
  fetchWithBasicAuth,
  getCredentials,
  promptCredentials,
  storeCredentials,
} from "@/lib/basicAuth"

describe("basicAuth", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal("fetch", vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  describe("getCredentials/storeCredentials/clearCredentials", () => {
    test("returns undefined when nothing is stored", () => {
      expect(getCredentials()).toBeUndefined()
    })

    test("returns stored credentials", () => {
      storeCredentials({ username: "user", password: "pass" })
      expect(getCredentials()).toEqual({ username: "user", password: "pass" })
    })

    test("clears stored credentials", () => {
      storeCredentials({ username: "user", password: "pass" })
      clearCredentials()
      expect(getCredentials()).toBeUndefined()
    })
  })

  describe("promptCredentials", () => {
    test("returns credentials when both prompts are answered", () => {
      vi.spyOn(window, "prompt")
        .mockReturnValueOnce("user")
        .mockReturnValueOnce("pass")

      expect(promptCredentials()).toEqual({
        username: "user",
        password: "pass",
      })
    })

    test("returns undefined when username prompt is cancelled", () => {
      vi.spyOn(window, "prompt").mockReturnValueOnce(null)

      expect(promptCredentials()).toBeUndefined()
    })

    test("returns undefined when password prompt is cancelled", () => {
      vi.spyOn(window, "prompt")
        .mockReturnValueOnce("user")
        .mockReturnValueOnce(null)

      expect(promptCredentials()).toBeUndefined()
    })
  })

  describe("fetchWithBasicAuth", () => {
    test("prompts and stores credentials on first use", async () => {
      vi.spyOn(window, "prompt")
        .mockReturnValueOnce("user")
        .mockReturnValueOnce("pass")
      vi.mocked(fetch).mockResolvedValue({ status: 200, ok: true } as Response)

      const response = await fetchWithBasicAuth("https://example.com")

      expect(response.status).toBe(200)
      expect(fetch).toHaveBeenCalledWith("https://example.com", {
        headers: { Authorization: `Basic ${btoa("user:pass")}` },
      })
      expect(getCredentials()).toEqual({ username: "user", password: "pass" })
    })

    test("reuses stored credentials without prompting", async () => {
      storeCredentials({ username: "user", password: "pass" })
      const promptSpy = vi.spyOn(window, "prompt")
      vi.mocked(fetch).mockResolvedValue({ status: 200, ok: true } as Response)

      await fetchWithBasicAuth("https://example.com")

      expect(promptSpy).not.toHaveBeenCalled()
      expect(fetch).toHaveBeenCalledWith("https://example.com", {
        headers: { Authorization: `Basic ${btoa("user:pass")}` },
      })
    })

    test("clears credentials, re-prompts, and retries once on 401", async () => {
      storeCredentials({ username: "user", password: "wrong" })
      vi.spyOn(window, "prompt")
        .mockReturnValueOnce("user")
        .mockReturnValueOnce("correct")
      vi.mocked(fetch)
        .mockResolvedValueOnce({ status: 401, ok: false } as Response)
        .mockResolvedValueOnce({ status: 200, ok: true } as Response)

      const response = await fetchWithBasicAuth("https://example.com")

      expect(response.status).toBe(200)
      expect(fetch).toHaveBeenCalledTimes(2)
      expect(fetch).toHaveBeenNthCalledWith(2, "https://example.com", {
        headers: { Authorization: `Basic ${btoa("user:correct")}` },
      })
      expect(getCredentials()).toEqual({
        username: "user",
        password: "correct",
      })
    })

    test("throws when initial prompt is cancelled", async () => {
      vi.spyOn(window, "prompt").mockReturnValue(null)

      await expect(fetchWithBasicAuth("https://example.com")).rejects.toThrow(
        "Basic auth credentials are required",
      )
      expect(fetch).not.toHaveBeenCalled()
    })

    test("throws when retry prompt is cancelled after 401", async () => {
      storeCredentials({ username: "user", password: "wrong" })
      vi.spyOn(window, "prompt").mockReturnValue(null)
      vi.mocked(fetch).mockResolvedValue({ status: 401, ok: false } as Response)

      await expect(fetchWithBasicAuth("https://example.com")).rejects.toThrow(
        "Basic auth credentials are required",
      )
      expect(fetch).toHaveBeenCalledTimes(1)
    })

    test("treats a rejected fetch (e.g. CORS preflight failure) as a 401 and retries once", async () => {
      storeCredentials({ username: "user", password: "wrong" })
      vi.spyOn(window, "prompt")
        .mockReturnValueOnce("user")
        .mockReturnValueOnce("correct")
      vi.mocked(fetch)
        .mockRejectedValueOnce(new TypeError("Failed to fetch"))
        .mockResolvedValueOnce({ status: 200, ok: true } as Response)

      const response = await fetchWithBasicAuth("https://example.com")

      expect(response.status).toBe(200)
      expect(fetch).toHaveBeenCalledTimes(2)
      expect(fetch).toHaveBeenNthCalledWith(2, "https://example.com", {
        headers: { Authorization: `Basic ${btoa("user:correct")}` },
      })
      expect(getCredentials()).toEqual({
        username: "user",
        password: "correct",
      })
    })

    test("throws when retry prompt is cancelled after a rejected fetch", async () => {
      storeCredentials({ username: "user", password: "wrong" })
      vi.spyOn(window, "prompt").mockReturnValue(null)
      vi.mocked(fetch).mockRejectedValue(new TypeError("Failed to fetch"))

      await expect(fetchWithBasicAuth("https://example.com")).rejects.toThrow(
        "Basic auth credentials are required",
      )
      expect(fetch).toHaveBeenCalledTimes(1)
    })
  })
})

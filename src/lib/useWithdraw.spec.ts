import { describe, test, expect, vi, beforeEach } from "vitest"
import { useWithdraw } from "@/lib/useWithdraw"
import type { WithdrawResult } from "@/lib/useWithdraw"

interface TestDocument {
  documentNumber: string
  name: string
}

const mockSearch = vi.fn<(documentNumber: string) => Promise<TestDocument[]>>()
const mockWithdraw =
  vi.fn<(documentNumber: string) => Promise<WithdrawResult>>()

function createComposable() {
  return useWithdraw({ search: mockSearch, withdraw: mockWithdraw })
}

describe("useWithdraw", () => {
  beforeEach(() => {
    mockSearch.mockReset()
    mockWithdraw.mockReset()
  })

  describe("handleSearch", () => {
    test("shows error when document number is empty", async () => {
      const { searchStatusMessage, handleSearch } = createComposable()

      await handleSearch("")

      expect(searchStatusMessage.value?.severity).toBe("error")
      expect(searchStatusMessage.value?.title).toBe("Dokumentnummer fehlt.")
      expect(searchStatusMessage.value?.detail).toBe(
        "Um die Suche starten zu können, müssen Sie eine Dokumentnummer eingeben.",
      )
      expect(mockSearch).not.toHaveBeenCalled()
    })

    test("shows error when search returns no results", async () => {
      mockSearch.mockResolvedValueOnce([])
      const { searchStatusMessage, handleSearch } = createComposable()

      await handleSearch("DOC-123")

      expect(searchStatusMessage.value?.severity).toBe("error")
      expect(searchStatusMessage.value?.title).toBe("Kein Treffer.")
      expect(searchStatusMessage.value?.detail).toBe(
        "Die Suche hat keinen Treffer erzielt. Überprüfen Sie Ihre Eingaben.",
      )
    })

    test("populates entries on successful search", async () => {
      const docs: TestDocument[] = [{ documentNumber: "DOC-123", name: "Test" }]
      mockSearch.mockResolvedValueOnce(docs)
      const { entries, searchStatusMessage, handleSearch } = createComposable()

      await handleSearch("DOC-123")

      expect(entries.value).toEqual(docs)
      expect(searchStatusMessage.value).toBeNull()
    })

    test("shows error message when search throws", async () => {
      mockSearch.mockRejectedValueOnce(new Error("500"))
      const { searchStatusMessage, handleSearch } = createComposable()

      await handleSearch("DOC-123")

      expect(searchStatusMessage.value?.severity).toBe("error")
      expect(searchStatusMessage.value?.title).toBe("Fehler.")
      expect(searchStatusMessage.value?.detail).toContain(
        "Während der Suche ist ein Fehler aufgetreten",
      )
      expect(searchStatusMessage.value?.detail).toContain("Error: 500")
    })

    test("clears previous results and status on new search", async () => {
      const docs: TestDocument[] = [{ documentNumber: "DOC-123", name: "Test" }]
      mockSearch.mockResolvedValueOnce(docs).mockResolvedValueOnce([])
      const { entries, searchStatusMessage, handleSearch } = createComposable()

      await handleSearch("DOC-123")
      expect(entries.value).toHaveLength(1)

      await handleSearch("UNKNOWN")
      expect(entries.value).toHaveLength(0)
      expect(searchStatusMessage.value?.title).toBe("Kein Treffer.")
    })
  })

  describe("handleWithdraw", () => {
    test("sets withdrawResult with ERROR status when withdraw returns an error result", async () => {
      mockWithdraw.mockResolvedValueOnce({
        status: "ERROR",
        documentNumber: "DOC-1",
        detail: "Withdraw error.",
      })
      const { withdrawResult, handleWithdraw } = createComposable()

      await handleWithdraw("DOC-1")

      expect(withdrawResult.value).toStrictEqual({
        status: "ERROR",
        documentNumber: "DOC-1",
        detail: "Withdraw error.",
      })
      expect(mockSearch).not.toHaveBeenCalled()
    })

    test("calls withdraw with the correct documentNumber and sets result", async () => {
      mockWithdraw.mockResolvedValueOnce({
        status: "WITHDRAWN",
        documentNumber: "DOC-42",
      })
      const { withdrawResult, handleWithdraw } = createComposable()

      await handleWithdraw("DOC-42")

      expect(mockWithdraw).toHaveBeenCalledWith("DOC-42")
      expect(withdrawResult.value?.status).toBe("WITHDRAWN")
      expect(withdrawResult.value?.documentNumber).toBe("DOC-42")
    })
  })
})

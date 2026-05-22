import { describe, test, expect, vi, beforeEach } from "vitest"
import { useWithdraw } from "@/lib/useWithdraw"

interface TestDocument {
  documentNumber: string
  name: string
}

const mockSearch = vi.fn<(documentNumber: string) => Promise<TestDocument[]>>()
const mockWithdraw = vi.fn<(documentNumber: string) => Promise<void>>()

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
      const { statusMessage, handleSearch } = createComposable()

      await handleSearch("")

      expect(statusMessage.value?.severity).toBe("error")
      expect(statusMessage.value?.title).toBe("Dokumentnummer fehlt.")
      expect(statusMessage.value?.detail).toBe(
        "Um die Suche starten zu können, müssen Sie eine Dokumentnummer eingeben.",
      )
      expect(mockSearch).not.toHaveBeenCalled()
    })

    test("shows error when search returns no results", async () => {
      mockSearch.mockResolvedValueOnce([])
      const { statusMessage, handleSearch } = createComposable()

      await handleSearch("DOC-123")

      expect(statusMessage.value?.severity).toBe("error")
      expect(statusMessage.value?.title).toBe("Kein Treffer.")
      expect(statusMessage.value?.detail).toBe(
        "Die Suche hat keinen Treffer erzielt. Überprüfen Sie Ihre Eingaben.",
      )
    })

    test("populates entries on successful search", async () => {
      const docs: TestDocument[] = [{ documentNumber: "DOC-123", name: "Test" }]
      mockSearch.mockResolvedValueOnce(docs)
      const { entries, statusMessage, handleSearch } = createComposable()

      await handleSearch("DOC-123")

      expect(entries.value).toEqual(docs)
      expect(statusMessage.value).toBeNull()
    })

    test("shows error message when search throws", async () => {
      mockSearch.mockRejectedValueOnce(new Error("500"))
      const { statusMessage, handleSearch } = createComposable()

      await handleSearch("DOC-123")

      expect(statusMessage.value?.severity).toBe("error")
      expect(statusMessage.value?.title).toBe("Fehler.")
      expect(statusMessage.value?.detail).toContain(
        "Während der Suche ist ein Fehler aufgetreten",
      )
      expect(statusMessage.value?.detail).toContain("Error: 500")
    })

    test("clears previous results and status on new search", async () => {
      const docs: TestDocument[] = [{ documentNumber: "DOC-123", name: "Test" }]
      mockSearch.mockResolvedValueOnce(docs).mockResolvedValueOnce([])
      const { entries, statusMessage, handleSearch } = createComposable()

      await handleSearch("DOC-123")
      expect(entries.value).toHaveLength(1)

      await handleSearch("UNKNOWN")
      expect(entries.value).toHaveLength(0)
      expect(statusMessage.value?.title).toBe("Kein Treffer.")
    })
  })

  describe("handleWithdraw", () => {
    test("shows success message after successful withdraw", async () => {
      const docs: TestDocument[] = [{ documentNumber: "DOC-1", name: "First" }]
      mockSearch.mockResolvedValueOnce(docs)
      mockWithdraw.mockResolvedValueOnce(undefined)
      const { statusMessage, handleWithdraw } = createComposable()

      await handleWithdraw("DOC-1")

      expect(statusMessage.value?.severity).toBe("success")
      expect(statusMessage.value?.title).toBe("Erfolgreich zurückgezogen.")
      expect(statusMessage.value?.detail).toBe(
        "Das Dokument wurde erfolgreich aus dem Portal entfernt.",
      )

      expect(mockSearch).toHaveBeenCalledTimes(1)
    })

    test("shows error message when withdraw throws", async () => {
      const docs: TestDocument[] = [{ documentNumber: "DOC-1", name: "First" }]
      mockSearch.mockResolvedValueOnce(docs)
      mockWithdraw.mockRejectedValueOnce(new Error("500"))
      const { statusMessage, handleWithdraw } = createComposable()

      await handleWithdraw("DOC-1")

      expect(statusMessage.value?.severity).toBe("error")
      expect(statusMessage.value?.title).toBe("Fehler.")
      expect(statusMessage.value?.detail).toContain(
        "Beim Zurückziehen des Dokuments ist ein Fehler aufgetreten",
      )
    })

    test("calls withdraw with the correct documentNumber", async () => {
      const docs: TestDocument[] = [{ documentNumber: "DOC-42", name: "Test" }]
      mockSearch.mockResolvedValueOnce(docs)
      mockWithdraw.mockResolvedValueOnce(undefined)
      const { handleWithdraw } = createComposable()

      await handleWithdraw("DOC-42")

      expect(mockWithdraw).toHaveBeenCalledWith("DOC-42")
    })
  })
})

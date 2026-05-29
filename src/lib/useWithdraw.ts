import { ref } from "vue"

export type WithdrawResult =
  | {
      status:
        | "WITHDRAWN"
        | "NOT_FOUND_IN_DATABASE_BUT_WITHDRAWN_FROM_BUCKET"
        | "NOT_PUBLISHED"
        | "NOT_FOUND"
      documentNumber: string
    }
  | {
      status: "ERROR"
      documentNumber: string
      detail?: string
    }

export type StatusMessage = {
  title: string
  detail: string
  severity: "error" | "success" | "info" | "warning"
}

export interface UseWithdrawOptions<T> {
  search: (query: string) => Promise<T[]>
  withdraw: (documentNumber: string) => Promise<WithdrawResult>
}

export function useWithdraw<T>({ search, withdraw }: UseWithdrawOptions<T>) {
  const entries = ref<T[]>([])
  const searchStatusMessage = ref<StatusMessage | null>(null)
  const withdrawResult = ref<WithdrawResult | null>(null)

  async function handleSearch(query: string) {
    searchStatusMessage.value = null
    entries.value = []

    if (!query) {
      searchStatusMessage.value = {
        severity: "error",
        title: "Dokumentnummer fehlt.",
        detail:
          "Um die Suche starten zu können, müssen Sie eine Dokumentnummer eingeben.",
      }
      return
    }

    try {
      const results = await search(query)
      if (results.length === 0) {
        searchStatusMessage.value = {
          severity: "error",
          title: "Kein Treffer.",
          detail:
            "Die Suche hat keinen Treffer erzielt. Überprüfen Sie Ihre Eingaben.",
        }
        return
      }

      entries.value = results
    } catch (error) {
      searchStatusMessage.value = {
        severity: "error",
        title: "Fehler.",
        detail: `Während der Suche ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut: ${error}`,
      }
    }
  }

  async function handleWithdraw(documentNumber: string) {
    withdrawResult.value = await withdraw(documentNumber)
  }

  return {
    entries,
    searchStatusMessage,
    withdrawResult,
    handleSearch,
    handleWithdraw,
  }
}

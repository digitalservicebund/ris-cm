import { ref } from "vue"

export type StatusMessage = {
  title: string
  detail: string
  severity: "error" | "success"
}

export interface UseWithdrawOptions<T> {
  search: (query: string) => Promise<T[]>
  withdraw: (documentNumber: string) => Promise<void>
}

export function useWithdraw<T>({ search, withdraw }: UseWithdrawOptions<T>) {
  const entries = ref<T[]>([])
  const statusMessage = ref<StatusMessage | null>(null)

  async function handleSearch(query: string) {
    statusMessage.value = null
    entries.value = []

    if (!query) {
      statusMessage.value = {
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
        statusMessage.value = {
          severity: "error",
          title: "Kein Treffer.",
          detail:
            "Die Suche hat keinen Treffer erzielt. Überprüfen Sie Ihre Eingaben.",
        }
        return
      }

      entries.value = results
    } catch (error) {
      statusMessage.value = {
        severity: "error",
        title: "Fehler.",
        detail: `Während der Suche ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut: ${error}`,
      }
    }
  }

  async function handleWithdraw(documentNumber: string) {
    try {
      await withdraw(documentNumber)
      statusMessage.value = {
        severity: "success",
        title: "Erfolgreich zurückgezogen.",
        detail: "Das Dokument wurde erfolgreich aus dem Portal entfernt.",
      }

      entries.value = await search(documentNumber)
    } catch (error) {
      statusMessage.value = {
        severity: "error",
        title: "Fehler.",
        detail: `Beim Zurückziehen des Dokuments ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut: ${error}`,
      }
    }
  }

  return { entries, statusMessage, handleSearch, handleWithdraw }
}

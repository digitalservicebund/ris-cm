import type { Ref } from "vue"
import { ref } from "vue"

/**
 * Result of a withdraw action
 */
export type WithdrawResult =
  | {
      /**
       * The status of the withdraw action
       *
       * WITHDRAWN - The document was successfully withdrawn
       * NOT_FOUND_IN_DATABASE_BUT_WITHDRAWN_FROM_BUCKET - The document couldn't be found in the database but was found and withdrawn from the bucket
       * NOT_PUBLISHED - The document was found in the database but didn't need to be withdrawn
       * NOT_FOUND - The document couldn't be found. Neither in the database nor in the bucket
       */
      status:
        | "WITHDRAWN"
        | "NOT_FOUND_IN_DATABASE_BUT_WITHDRAWN_FROM_BUCKET"
        | "NOT_PUBLISHED"
        | "NOT_FOUND"
      /**
       * Document number of the document that was withdrawn or failed to be withdrawn
       */
      documentNumber: string
    }
  | {
      /**
       * The status of the withdraw action
       *
       * ERROR - Some unexpected error happened during the withdrawal
       */
      status: "ERROR"
      /**
       * Document number of the document that couldn't be withdrawn
       */
      documentNumber: string
      /**
       * Details about the error that occurred
       */
      detail?: string
    }

export type StatusMessage = {
  title: string
  detail: string
  severity: "error" | "success" | "info" | "warning"
}

export interface UseWithdrawOptions<T> {
  /**
   * Search for a document
   *
   * @param query the document number to search for
   */
  search: (query: string) => Promise<T[]>
  /**
   * Withdraw a document
   *
   * This method should never throw. Instead an appropriate {@link WithdrawResult} should be returned.
   *
   * @param documentNumber the document number of the document to withdraw
   */
  withdraw: (documentNumber: string) => Promise<WithdrawResult>
}

export interface UseWithdrawReturn<T> {
  /**
   * The search results
   */
  entries: Ref<T[]>
  /**
   * The status message of the search. E.g. if something went wrong
   */
  searchStatusMessage: Ref<StatusMessage | null>
  /**
   * The result of a withdraw
   */
  withdrawResult: Ref<WithdrawResult | null>
  /**
   * Method to trigger a search
   */
  handleSearch: (query: string) => Promise<void>
  /**
   * Method to trigger a withdraw
   */
  handleWithdraw: (documentNumber: string) => Promise<void>
}

export function useWithdraw<T>({
  search,
  withdraw,
}: UseWithdrawOptions<T>): UseWithdrawReturn<T> {
  const entries: Ref<T[]> = ref([])
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

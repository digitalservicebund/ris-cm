<script lang="ts" setup>
import { ref, onMounted } from "vue"
import { useRoute } from "vue-router"
import Message from "primevue/message"
import SearchForm from "@/components/SearchForm.vue"
import ResultListCaselaw from "@/components/ResultListCaselaw.vue"
import {
  type CaselawSearchResult,
  searchCaselaw,
  withdrawDocument,
} from "@/lib/caselaw"

const route = useRoute()
const entries = ref<CaselawSearchResult[]>([])

type StatusMessage = {
  title: string
  detail: string
  severity: "error" | "success"
}
const statusMessage = ref<StatusMessage | null>(null)

async function handleSearch(documentNumber: string) {
  statusMessage.value = null
  entries.value = []

  if (!documentNumber) {
    statusMessage.value = {
      severity: "error",
      title: "Dokumentnummer fehlt.",
      detail:
        "Um die Suche starten zu können, müssen Sie eine Dokumentnummer eingeben.",
    }
    return
  }

  try {
    const results = await searchCaselaw(documentNumber)
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
    await withdrawDocument(documentNumber)
    statusMessage.value = {
      severity: "success",
      title: "Erfolgreich zurückgezogen.",
      detail: "Das Dokument wurde erfolgreich aus dem Portal entfernt.",
    }
    entries.value = entries.value.filter(
      (e) => e.documentNumber !== documentNumber,
    )
  } catch (error) {
    statusMessage.value = {
      severity: "error",
      title: "Fehler.",
      detail: `Beim Zurückziehen des Dokuments ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut: ${error}`,
    }
  }
}

onMounted(() => {
  const param = route.query["dokumentnummer"]
  const documentNumber = Array.isArray(param) ? param[0] : param
  if (documentNumber) {
    handleSearch(documentNumber)
  }
})
</script>

<template>
  <div class="flex flex-col m-24 gap-8">
    <Message v-if="statusMessage" :severity="statusMessage.severity">
      <p class="ris-body1-bold">{{ statusMessage.title }}</p>
      {{ statusMessage.detail }}
    </Message>
    <SearchForm @search="handleSearch"></SearchForm>
    <ResultListCaselaw
      :entries="entries"
      @withdraw="handleWithdraw"
    ></ResultListCaselaw>
  </div>
</template>

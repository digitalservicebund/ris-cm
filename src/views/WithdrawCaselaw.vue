<script lang="ts" setup>
import { ref, onMounted } from "vue"
import { useRoute } from "vue-router"
import Message from "primevue/message"
import SearchForm from "@/components/SearchForm.vue"
import ResultListCaselaw from "@/components/ResultListCaselaw.vue"
import { type CaselawDocument, searchCaselaw } from "@/lib/caselaw"

const route = useRoute()
const entries = ref<CaselawDocument[]>([])

type ErrorMessage = { title: string; detail: string }
const errorMessage = ref<ErrorMessage | null>(null)

async function handleSearch(documentNumber: string) {
  errorMessage.value = null

  if (!documentNumber) {
    errorMessage.value = {
      title: "Dokumentnummer fehlt.",
      detail:
        "Um die Suche starten zu können, müssen Sie eine Dokumentnummer eingeben.",
    }
    return
  }

  try {
    const results = await searchCaselaw(documentNumber)
    if (results.length === 0) {
      errorMessage.value = {
        title: "Kein Treffer.",
        detail:
          "Die Suche hat keinen Treffer erzielt. Überprüfen Sie Ihre Eingaben.",
      }
    } else {
      entries.value = results
    }
  } catch (error) {
    errorMessage.value = {
      title: "Fehler.",
      detail: `Während der Suche ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut: ${error}`,
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
    <Message v-if="errorMessage" severity="error">
      <p class="ris-body1-bold">{{ errorMessage.title }}</p>
      {{ errorMessage.detail }}
    </Message>
    <SearchForm @search="handleSearch"></SearchForm>
    <ResultListCaselaw :entries="entries"></ResultListCaselaw>
  </div>
</template>

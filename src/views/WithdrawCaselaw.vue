<script lang="ts" setup>
import { ref, onMounted } from "vue"
import { useRoute } from "vue-router"
import SearchForm from "@/components/SearchForm.vue"
import ResultListCaselaw from "@/components/ResultListCaselaw.vue"
import { type CaselawDocument, searchCaselaw } from "@/lib/caselaw"

const route = useRoute()
const entries = ref<CaselawDocument[]>([])

async function handleSearch(documentNumber: string) {
  entries.value = await searchCaselaw(documentNumber)
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
    <SearchForm @search="handleSearch"></SearchForm>
    <ResultListCaselaw :entries="entries"></ResultListCaselaw>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from "vue"
import { useRoute } from "vue-router"
import Message from "primevue/message"
import SearchForm from "@/components/SearchForm.vue"
import ResultListCaselaw from "@/components/ResultListCaselaw.vue"
import { searchCaselaw, withdrawDocument } from "@/lib/caselaw"
import { useWithdraw } from "@/lib/useWithdraw"

const route = useRoute()

const { entries, statusMessage, handleSearch, handleWithdraw } = useWithdraw({
  search: searchCaselaw,
  withdraw: withdrawDocument,
})

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
    <h1 class="sr-only">Zurückziehen</h1>
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

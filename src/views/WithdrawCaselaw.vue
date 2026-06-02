<script lang="ts" setup>
import { onMounted, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import Message from "primevue/message"
import SearchForm from "@/components/SearchForm.vue"
import ResultListCaselaw from "@/components/ResultListCaselaw.vue"
import { search, withdraw } from "@/lib/caselaw"
import { useWithdraw } from "@/lib/useWithdraw"

const route = useRoute()
const router = useRouter()

const {
  entries,
  searchStatusMessage,
  withdrawResult,
  handleSearch,
  handleWithdraw,
} = useWithdraw({
  search,
  withdraw,
})

function navigateToResult(result: typeof withdrawResult.value) {
  router.push({
    name: "withdraw-caselaw-result",
    state: {
      withdrawResult: result ? JSON.stringify(result) : null,
    },
  })
}

watch(withdrawResult, (result) => {
  if (result) navigateToResult(result)
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
    <Message
      v-if="searchStatusMessage"
      :severity="searchStatusMessage.severity"
    >
      <p class="ris-body1-bold">{{ searchStatusMessage.title }}</p>
      {{ searchStatusMessage.detail }}
    </Message>
    <SearchForm @search="handleSearch"></SearchForm>
    <ResultListCaselaw
      :entries="entries"
      @withdraw="handleWithdraw"
    ></ResultListCaselaw>
  </div>
</template>

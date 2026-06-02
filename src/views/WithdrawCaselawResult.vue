<script lang="ts" setup>
import { computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import WithdrawResult from "@/components/WithdrawResult.vue"
import ResultListCaselaw from "@/components/ResultListCaselaw.vue"
import type { WithdrawResult as WithdrawResultType } from "@/lib/useWithdraw"
import { search } from "@/lib/caselaw"

const router = useRouter()

const state = globalThis.history.state as {
  withdrawResult?: string
}

const withdrawResult = computed<WithdrawResultType | null>(() => {
  if (!state.withdrawResult) return null
  return JSON.parse(state.withdrawResult) as WithdrawResultType
})

onMounted(() => {
  if (!state.withdrawResult) {
    router.replace({ name: "withdraw" })
  }
})
</script>

<template>
  <WithdrawResult
    v-if="withdrawResult"
    :withdraw-result="withdrawResult"
    :search-entries="search"
  >
    <template #resultList="{ entries }">
      <ResultListCaselaw :entries="entries" readonly />
    </template>
  </WithdrawResult>
</template>

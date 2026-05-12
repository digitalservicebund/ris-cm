<script lang="ts" setup>
import SearchForm from "@/components/SearchForm.vue"
import ResultListCaselaw from "@/components/ResultListCaselaw.vue"
import { CaselawDocument } from "@/lib/caselaw"

const entries: CaselawDocument[] = []
</script>

<template>
  <div class="flex flex-col m-24 gap-8">
    <SearchForm></SearchForm>
    <ResultListCaselaw :entries="entries"></ResultListCaselaw>
  </div>
</template>

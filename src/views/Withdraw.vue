<script lang="ts" setup>
import SearchForm from "@/components/SearchForm.vue"
import ResultList from "@/components/ResultList.vue"

const entries = [
  {
    documentNumber: "KORE123456789",
    court: "Bundesgerichtshof",
    typ: "Urteil",
    decisionDate: "15.03.2024",
    fileNumber: "VI ZR 12/23",
    visibleInPortal: true,
  },
  {
    documentNumber: "KVRE987654321",
    court: "Bundesverwaltungsgericht",
    typ: "Beschluss",
    decisionDate: "22.07.2023",
    fileNumber: "BVerwG 4 C 3.22",
    visibleInPortal: false,
  },
  {
    documentNumber: "BSGE112233445",
    court: "Bundessozialgericht",
    typ: "Urteil",
    decisionDate: "08.11.2023",
    fileNumber: "B 3 KR 7/22 R",
    visibleInPortal: true,
  },
]
</script>

<template>
  <div class="flex flex-col m-24">
    <SearchForm></SearchForm>
    <ResultList :entries="entries"></ResultList>
  </div>
</template>

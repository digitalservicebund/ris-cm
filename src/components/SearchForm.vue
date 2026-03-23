<script lang="ts" setup>
import Button from "primevue/button"
import RadioButton from "primevue/radiobutton"
import InputText from "primevue/inputtext"
import { useRouter, useRoute, useLink } from "vue-router"
import { ref, computed } from "vue"

const router = useRouter()
const route = useRoute()

const documentType = computed({
  get: () => route.name,
  set: (newValue) => {
    router.push({
      name: newValue,
      query: route.query,
    })
  },
})

const documentNumber = computed({
  get: () => route.query?.dokumentnummer ?? "",
  set: (newValue) => {
    router.push({ query: { dokumentnummer: newValue } })
  },
})

const handleSearch = () => {}
</script>

<template>
  <div class="flex flex-col bg-blue-200">
    <div class="m-24 ris-body1-bold">
      Welches Dokument wollen Sie zurückziehen? Wählen Sie die Dokumentart und
      geben Sie die Dokumentnummer ein, um das Dokument zu suchen.
    </div>
    <div class="flex flex-row mx-24 mt-8 items-center">
      <div class="min-w-160">Dokumentart&#xFEFF;*</div>
      <div class="flex flex-col gap-8 lg:flex-row lg:gap-48 ml-80">
        <div class="flex flex-row">
          <RadioButton
            input-id="caselaw-button"
            aria-label="Gerichtsentscheidungen"
            name="kind_of_document"
            size="small"
            value="withdraw-caselaw"
            v-model="documentType"
          />
          <label for="caselaw-button" class="ml-12"
            >Gerichtsentscheidungen</label
          >
        </div>
        <div class="flex flex-row">
          <RadioButton
            input-id="adm-button"
            aria-label="Verwaltungsvorschriften"
            name="kind_of_document"
            size="small"
            value="withdraw-adm"
            v-model="documentType"
          />
          <label for="adm-button" class="ml-12">Verwaltungsvorschriften</label>
        </div>
        <div class="flex flex-row">
          <RadioButton
            input-id="literature-button"
            aria-label="Literaturnachweise"
            name="kind_of_document"
            size="small"
            value="withdraw-literature"
            v-model="documentType"
          />
          <label for="literature-button" class="ml-12"
            >Literaturnachweise</label
          >
        </div>
      </div>
    </div>
    <div class="mx-24 mt-32 flex flex-row items-center">
      <div class="min-w-160">Dokumentnummer&#xFEFF;*</div>
      <div class="ml-80">
        <InputText
          id="docnumber"
          aria-label="Dokumentnummer Suche"
          class="w-[300px]"
          v-model="documentNumber"
        />
      </div>
    </div>
    <div class="m-24 flex flex-row justify-end">
      <Button label="Suche starten" @click="handleSearch" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import Button from "primevue/button"
import RadioButton from "primevue/radiobutton"
import InputText from "primevue/inputtext"
</script>

<template>
  <div class="flex flex-col bg-blue-200">
    <div class="m-24 ris-body1-bold">
      Welches Dokument wollen Sie zurückziehen? Wählen Sie die Dokumentart und
      geben Sie die Dokumentnummer ein, um das Dokument zu suchen.
    </div>
    <div class="flex flex-row mx-24 mt-8">
      <div class="w-160">Dokumentart *</div>
      <div class="flex flex-row ml-80">
        <RadioButton
          id="caselaw-button"
          aria-label="Gerichtsentscheidungen"
          name="kind_of_document"
          size="small"
          value="caselaw"
        />
        <label for="caselaw-button" class="ml-12">Gerichtsentscheidungen</label>
      </div>
      <div class="flex flex-row ml-48">
        <RadioButton
          id="adm-button"
          aria-label="Verwaltungsvorschriften"
          name="kind_of_document"
          size="small"
          value="adm"
        />
        <label for="adm-button" class="ml-12">Verwaltungsvorschriften</label>
      </div>
      <div class="flex flex-row ml-48">
        <RadioButton
          id="literature-button"
          aria-label="Literaturnachweise"
          name="kind_of_document"
          size="small"
          value="literature"
        />
        <label for="literature-button" class="ml-12">Literaturnachweise</label>
      </div>
    </div>
    <div class="mx-24 mt-32 flex flex-row">
      <div class="w-160">Dokumentnummer *</div>
      <div class="ml-80">
        <InputText
          id="docnumber"
          aria-label="Dokumentnummer Suche"
          class="w-[300px]"
        />
      </div>
    </div>
    <div class="m-24 flex flex-row justify-end">
      <Button label="Suche starten" />
    </div>
  </div>
</template>

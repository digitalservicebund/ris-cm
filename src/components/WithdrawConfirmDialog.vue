<script lang="ts" setup>
import ConfirmDialog from "primevue/confirmdialog"
import IconFile from "~icons/ic/baseline-insert-drive-file"
</script>

<template>
  <ConfirmDialog group="withdraw" class="max-w-[37rem]">
    <template #message="{ message }">
      <div>
        <p>Sind Sie sicher, dass Sie dieses Dokument zurückziehen wollen?</p>
        <div
          class="w-fit my-4 mr-6 inline-flex items-center rounded-full bg-blue-300 px-12 py-4"
        >
          <IconFile />
          <span>{{ message.message }}</span>
        </div>
        <p>
          Das Dokument wird aus dem Portal entfernt. Dieser Schritt kann nicht
          rückgängig gemacht werden. Eine Neuveröffentlichung kann dann nur über
          Juris erfolgen.
        </p>
      </div>
    </template>
  </ConfirmDialog>
</template>

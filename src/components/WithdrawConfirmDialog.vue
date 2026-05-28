<script lang="ts" setup>
import Chip from "primevue/chip"
import ConfirmDialog from "primevue/confirmdialog"
import IconFile from "~icons/ic/baseline-insert-drive-file"
</script>

<template>
  <ConfirmDialog group="withdraw" class="max-w-[37rem]">
    <template #message="{ message }">
      <div>
        <p>Sind Sie sicher, dass Sie dieses Dokument zurückziehen wollen?</p>
        <Chip class="w-fit my-4" :label="message.message">
          <template #icon>
            <IconFile />
          </template>
        </Chip>
        <p>
          Das Dokument wird aus dem Portal entfernt. Dieser Schritt kann nicht
          rückgängig gemacht werden. Eine Neuveröffentlichung kann dann nur über
          Juris erfolgen.
        </p>
      </div>
    </template>
  </ConfirmDialog>
</template>

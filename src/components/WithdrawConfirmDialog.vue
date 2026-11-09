<script lang="ts" setup>
import IconFile from "~icons/ic/baseline-insert-drive-file"
import Button from "@/components/ui/Button.vue"

interface Props {
  documentNumber: string
  dialogId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  confirm: []
}>()
</script>

<template>
  <dialog
    :id="dialogId"
    class="m-auto max-w-[37rem] bg-white p-32"
    role="alertdialog"
    title="Dokument zurückziehen"
  >
    <h1 class="text-2xl">Dokument zurückziehen</h1>
    <div class="py-8">
      <p>Sind Sie sicher, dass Sie dieses Dokument zurückziehen wollen?</p>
      <div
        class="w-fit my-4 mr-6 inline-flex items-center rounded-full bg-blue-300 px-12 py-4"
      >
        <IconFile />
        <span>{{ documentNumber }}</span>
      </div>
      <p>
        Das Dokument wird aus dem Portal entfernt. Dieser Schritt kann nicht
        rückgängig gemacht werden. Eine Neuveröffentlichung kann dann nur über
        Juris erfolgen.
      </p>
    </div>
    <div class="flex justify-end gap-8">
      <Button :commandfor="dialogId" command="close">Abbrechen</Button>
      <Button @click="$emit('confirm')">Dokument zurückziehen</Button>
    </div>
  </dialog>
</template>

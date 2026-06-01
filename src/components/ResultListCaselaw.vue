<script lang="ts" setup>
import Button from "primevue/button"
import Column from "primevue/column"
import DataTable from "primevue/datatable"
import { useConfirm } from "primevue/useconfirm"
import IconOpenInNew from "~icons/ic/baseline-open-in-new"
import IconVisibilityOff from "~icons/ic/baseline-visibility-off"
import { useEnv } from "@/lib/env"
import { CaselawSearchResult } from "@/lib/caselaw"
import WithdrawConfirmDialog from "@/components/WithdrawConfirmDialog.vue"

const { env } = useEnv()
const confirm = useConfirm()

function portalUrl(documentNumber: string): string | undefined {
  if (!env.value) return undefined
  return `${env.value.portalBaseUrl}/case-law/${documentNumber}`
}

const props = defineProps<{
  entries?: CaselawSearchResult[]
  readonly?: boolean
}>()

const emit = defineEmits<{
  withdraw: [documentNumber: string]
}>()

function confirmWithdraw(documentNumber: string) {
  confirm.require({
    group: "withdraw",
    header: "Dokument zurückziehen",
    message: documentNumber,
    acceptLabel: "Dokument zurückziehen",
    rejectLabel: "Abbrechen",
    accept: () => emit("withdraw", documentNumber),
  })
}
</script>

<template>
  <WithdrawConfirmDialog />

  <div
    v-if="props.entries == null || props.entries.length == 0"
    class="grid items-center justify-items-center bg-white grow"
  >
    Starten Sie die Suche.
  </div>
  <DataTable v-else :value="props.entries" class="w-full">
    <Column field="documentNumber" header="Dokumentnummer" />
    <Column field="court" header="Gericht" />
    <Column field="typ" header="Typ" />
    <Column field="decisionDate" header="Entscheidungsdatum" />
    <Column field="fileNumber" header="Aktenzeichen" />
    <Column field="visibleInPortal" header="Sichtbar im Portal">
      <template #body="{ data }">
        {{ data.visibleInPortal ? "Ja" : "Nein" }}
      </template>
    </Column>
    <Column header="Aktionen" header-class="sr-only" class="text-right">
      <template #body="{ data }">
        <div class="flex flex-row justify-end gap-8">
          <Button
            v-if="!props.readonly"
            v-tooltip.bottom="'Aus Portal entfernen'"
            aria-label="Zurückziehen"
            label="Zurückziehen"
            severity="secondary"
            size="small"
            @click="confirmWithdraw(data.documentNumber)"
          >
            <template #icon>
              <IconVisibilityOff />
            </template>
          </Button>
          <Button
            v-tooltip.bottom="'Portal'"
            aria-label="Portal"
            as="a"
            :href="portalUrl(data.documentNumber)"
            target="_blank"
            rel="noopener"
            severity="secondary"
            size="small"
          >
            <template #icon>
              <IconOpenInNew />
            </template>
          </Button>
        </div>
      </template>
    </Column>
  </DataTable>
</template>

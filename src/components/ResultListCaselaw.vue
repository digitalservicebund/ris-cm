<script lang="ts" setup>
import { computed } from "vue"
import Button from "./ui/Button.vue"
import DataTable, {
  type DataTableColumn,
  type DataTableRow,
} from "./ui/DataTable.vue"
import { useConfirm } from "primevue/useconfirm"
import IconOpenInNew from "~icons/ic/baseline-open-in-new"
import IconVisibilityOff from "~icons/ic/baseline-visibility-off"
import { useEnv } from "@/lib/env"
import { CaselawSearchResult } from "@/lib/caselaw"
import WithdrawConfirmDialog from "@/components/WithdrawConfirmDialog.vue"

type Row = DataTableRow &
  CaselawSearchResult & {
    actions?: never
  }

const columns: DataTableColumn<Row>[] = [
  { key: "documentNumber", label: "Dokumentnummer" },
  { key: "court", label: "Gericht" },
  { key: "typ", label: "Typ" },
  { key: "decisionDate", label: "Entscheidungsdatum" },
  { key: "fileNumber", label: "Aktenzeichen" },
  { key: "visibleInPortal", label: "Sichtbar im Portal" },
  { key: "actions", label: "" },
]

const { env } = useEnv()
const confirm = useConfirm()

function portalUrl(documentNumber: string): string | undefined {
  if (!env.value) return undefined
  return `${env.value.portalBaseUrl}/gerichtsentscheidungen/${documentNumber}`
}

const props = defineProps<{
  entries?: CaselawSearchResult[]
  readonly?: boolean
}>()

const rows = computed<Row[]>(
  () =>
    props.entries?.map((entry) => ({
      ...entry,
      key: entry.documentNumber,
    })) ?? [],
)

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

  <DataTable :columns="columns" :rows="rows">
    <template #cell-visibleInPortal="{ row }">
      {{ row.visibleInPortal ? "Ja" : "Nein" }}
    </template>
    <template #cell-actions="{ row }">
      <div class="flex flex-row justify-end gap-8">
        <Button
          v-if="!props.readonly"
          aria-label="Zurückziehen"
          label="Zurückziehen"
          severity="secondary"
          size="small"
          @click="confirmWithdraw(row.documentNumber)"
        >
          <template #icon>
            <IconVisibilityOff />
          </template>
        </Button>
        <Button
          aria-label="Im Portal öffnen"
          label="Im Portal öffnen"
          as="a"
          :href="portalUrl(row.documentNumber)"
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
    <template #empty>
      <div class="grid items-center justify-items-center bg-white grow">
        Starten Sie die Suche.
      </div>
    </template>
  </DataTable>
</template>

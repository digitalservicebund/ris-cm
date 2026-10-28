<script lang="ts" setup>
import { computed } from "vue"
import Button from "./ui/Button.vue"
import DataTable, {
  type DataTableColumn,
  type DataTableRow,
} from "./ui/DataTable.vue"
import IconOpenInNew from "~icons/ic/baseline-open-in-new"
import IconVisibilityOff from "~icons/ic/baseline-visibility-off"
import { useEnv } from "@/lib/env"
import { AdministrativeDirectiveSearchResult } from "@/lib/administrativeDirective"
import WithdrawConfirmDialog from "@/components/WithdrawConfirmDialog.vue"

type Row = DataTableRow &
  AdministrativeDirectiveSearchResult & {
    actions?: never
  }

const columns: DataTableColumn<Row>[] = [
  { key: "documentNumber", label: "Dokumentnummer" },
  { key: "visibleInPortal", label: "Sichtbar im Portal" },
  { key: "actions", label: "" },
]

const { env } = useEnv()

function portalUrl(documentNumber: string): string | undefined {
  if (!env.value) return undefined
  return `${env.value.portalBaseUrl}/verwaltungsregelungen/${documentNumber}`
}

const props = defineProps<{
  entries?: AdministrativeDirectiveSearchResult[]
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
</script>

<template>
  <DataTable :columns="columns" :rows="rows">
    <template #cell-visibleInPortal="{ row }">
      {{ row.visibleInPortal ? "Ja" : "Nein" }}
    </template>
    <template #cell-actions="{ row }">
      <div class="flex flex-row justify-end gap-8">
        <WithdrawConfirmDialog
          dialog-id="confirm-withdraw"
          :document-number="row.documentNumber"
          @confirm="$emit('withdraw', row.documentNumber)"
        />

        <Button
          v-if="!props.readonly"
          aria-label="Zurückziehen"
          label="Zurückziehen"
          severity="secondary"
          size="small"
          command="show-modal"
          commandfor="confirm-withdraw"
        >
          <template #icon>
            <IconVisibilityOff />
          </template>
        </Button>
        <Button
          label="Im Portal öffnen"
          aria-label="Portal"
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

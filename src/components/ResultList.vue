<script lang="ts" setup>
import Button from "primevue/button"
import Column from "primevue/column"
import DataTable from "primevue/datatable"
import IconOpenInNew from "~icons/ic/baseline-open-in-new"
import IconVisibilityOff from "~icons/ic/baseline-visibility-off"
import { useEnv } from "@/lib/env"

const { env } = useEnv()

function portalUrl(documentNumber: string): string | undefined {
  if (!env.value?.portalBaseUrl) return undefined
  return `${env.value.portalBaseUrl}/case-law/${documentNumber}`
}

interface CaselawEntry {
  documentNumber: string
  court: string
  typ: string
  decisionDate: string
  fileNumber: string
  visibleInPortal: boolean
}

const props = defineProps<{
  entries: CaselawEntry[]
}>()
</script>

<template>
  <div
    v-if="props.entries == null"
    class="grid items-center justify-items-center bg-white grow"
  >
    Starten Sie die Suche.
  </div>
  <DataTable v-if="props.entries" :value="props.entries" class="w-full">
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
    <Column header="" class="text-right">
      <template #body="{ data }">
        <div class="flex flex-row justify-end gap-8">
          <Button
            v-tooltip.bottom="'Aus Portal entfernen'"
            aria-label="Zurückziehen"
            label="Zurückziehen"
            severity="secondary"
            size="small"
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

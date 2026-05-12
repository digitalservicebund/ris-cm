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

const entries: CaselawEntry[] = [
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
  <div
    v-if="entries == null"
    class="grid items-center justify-items-center bg-white grow"
  >
    Starten Sie die Suche.
  </div>
  <DataTable v-if="entries" :value="entries" class="w-full">
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
            v-tooltip="'Aus Portal entfernen'"
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
            v-tooltip="'Portal'"
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

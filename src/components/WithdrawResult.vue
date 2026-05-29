<script lang="ts" setup generic="T">
import { computed, ref, watch } from "vue"
import { useRouter } from "vue-router"
import Message from "primevue/message"
import Button from "primevue/button"
import IconArrowBack from "~icons/ic/baseline-arrow-back"
import IconArrowForward from "~icons/ic/baseline-arrow-forward"
import type { WithdrawResult } from "@/lib/useWithdraw"

const props = defineProps<{
  withdrawResult: WithdrawResult
  searchEntries: (documentNumber: string) => Promise<T[]>
}>()

const router = useRouter()

const entries = ref<T[]>([])
const searchError = ref<string | null>(null)

const documentNumber = computed(() => props.withdrawResult.documentNumber)
const status = computed(() => props.withdrawResult.status)

watch(
  documentNumber,
  async (value) => {
    entries.value = []
    if (value) {
      try {
        entries.value = await props.searchEntries(value)
        searchError.value = null
      } catch (error) {
        console.error("Error during search of withdrawn document", error)
        searchError.value = `${error}`
      }
    }
  },
  { immediate: true },
)

type MessageSeverity = "success" | "info" | "warn" | "error"

const statusMessage = computed<{
  severity: MessageSeverity
  title: string
  detail: string
} | null>(() => {
  const result = props.withdrawResult
  switch (result.status) {
    case "WITHDRAWN":
    case "NOT_FOUND_IN_DATABASE_BUT_WITHDRAWN_FROM_BUCKET":
      return {
        severity: "success",
        title: "Erfolgreich zurückgezogen.",
        detail: "Das Dokument wurde erfolgreich aus dem Portal entfernt.",
      }
    case "NOT_PUBLISHED":
      return {
        severity: "info",
        title: "Nicht veröffentlicht",
        detail: "Das Dokument ist aktuell bereits nicht im Portal sichtbar.",
      }
    case "NOT_FOUND":
      return {
        severity: "warn",
        title: "Nicht gefunden",
        detail: "Das Dokument konnte nicht gefunden werden.",
      }
    case "ERROR":
      return {
        severity: "error",
        title: "Zurückziehen nicht erfolgreich.",
        detail: `Das Dokument konnte nicht aus dem Portal entfernt werden: ${result.detail}`,
      }
    default:
      return {
        severity: "error",
        title: "Zurückziehen vermutlich nicht erfolgreich.",
        detail: `Es ist etwas unerwartetes passiert.`,
      }
  }
})

function goBack() {
  router.back()
}
</script>

<template>
  <div class="flex flex-col m-24 gap-8">
    <h1 class="sr-only">Ergebnis Zurückziehen</h1>

    <Message v-if="statusMessage" :severity="statusMessage.severity">
      <p class="ris-body1-bold">{{ statusMessage.title }}</p>
      {{ statusMessage.detail }}
    </Message>

    <template
      v-if="
        status === 'WITHDRAWN' ||
        status === 'NOT_FOUND_IN_DATABASE_BUT_WITHDRAWN_FROM_BUCKET'
      "
    >
      <h2 class="font-bold">Folgendes Dokument wurde zurückgezogen:</h2>
      <p v-if="entries.length === 0">
        Das Dokument {{ documentNumber }} konnte nicht gefunden werden.
        <template v-if="searchError"> {{ searchError }}</template>
      </p>
      <slot v-else name="resultList" :entries="entries" />
      <p>
        Das Dokument ist im Portal ab sofort nicht mehr sichtbar. In der Suche
        kann das Dokument noch einige Minuten auffindbar sein, lässt sich aber
        nicht mehr aufrufen. Falls Aktivzitierungen enthalten sind, werden die
        Passivzitierungen in den entsprechenden Dokumenten entfernt.
      </p>
      <div class="flex justify-end">
        <RouterLink
          v-slot="{ navigate }"
          :to="{ name: 'withdraw-caselaw' }"
          custom
        >
          <Button label="Startseite" @click="navigate">
            <template #icon>
              <IconArrowForward />
            </template>
          </Button>
        </RouterLink>
      </div>
    </template>

    <template v-else>
      <h2 class="font-bold">
        Folgendes Dokument konnte nicht zurückgezogen werden:
      </h2>
      <p v-if="entries.length === 0">
        Das Dokument {{ documentNumber }} konnte nicht gefunden werden.
        <template v-if="searchError"> {{ searchError }}</template>
      </p>
      <slot v-else name="resultList" :entries="entries" />
      <div class="flex justify-start">
        <Button label="Zurück" @click="goBack">
          <template #icon>
            <IconArrowBack />
          </template>
        </Button>
      </div>
    </template>
  </div>
</template>

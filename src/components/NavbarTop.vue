<script lang="ts" setup>
import { ref } from "vue"
import { useRoute } from "vue-router"
import useSessionStore from "@/stores/sessionStore"
import IconPermIdentity from "~icons/ic/baseline-perm-identity"

const route = useRoute()
const session = useSessionStore()
const fontColor = ref<string>()
</script>

<template>
  <nav
    class="flex items-center justify-between border-y border-gray-400 px-16 py-16 print:hidden"
  >
    <div class="flex items-center gap-44">
      <div class="flex flex-col">
        <span
          aria-hidden="true"
          class="ris-body1-bold"
          :style="{ color: fontColor }"
        >
          Rechtsinformationen</span
        >

        <span aria-hidden="true" class="leading-none text-gray-900"
          >des Bundes</span
        >
      </div>

      <router-link
        class="ris-label1-regular p-8 hover:bg-yellow-500 hover:underline"
        :class="{
          underline: route.path.includes('zurueckziehen'),
        }"
        :to="{ name: 'Zurueckziehen' }"
        >Zurückziehen
      </router-link>
      <router-link
        class="ris-label1-regular p-8 hover:bg-yellow-500 hover:underline"
        :class="{
          underline: route.path.includes('inbox'),
        }"
        :to="{ name: 'UebersetzungenNormen' }"
        >Übersetzungen Normen
      </router-link>
    </div>

    <div v-if="session.user" class="flex gap-10">
      <IconPermIdentity />
      <div class="flex flex-row items-streach justify-start flex-nowrap">
        <div class="flex flex-col">{{ session.user?.name }}</div>
      </div>
    </div>
  </nav>
</template>

<script lang="ts" setup>
import { ref } from "vue"
import { useRoute, RouterLink } from "vue-router"
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
    <div class="flex items-center gap-[80px]">
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

      <div class="flex gap-48 w-full">
        <router-link
          class="ris-link1-regular hover:underline no-underline"
          active-class="underline decoration-3"
          :to="{ name: 'withdraw' }"
          >Zurückziehen
        </router-link>
        <router-link
          class="ris-link1-regular hover:underline no-underline"
          :to="{ name: 'uebersetzungen-normen' }"
          >Übersetzungen Normen
        </router-link>
      </div>
    </div>

    <div v-if="session.user" class="flex gap-8 pr-16">
      <IconPermIdentity />
      <div class="flex flex-row items-streach justify-start flex-nowrap">
        {{ session.user?.name }}
      </div>
    </div>
  </nav>
</template>

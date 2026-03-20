<script lang="ts" setup>
import { ref } from "vue"
import { useRoute } from "vue-router"
import useSessionStore from "@/stores/sessionStore"
import IconPermIdentity from "~icons/ic/baseline-perm-identity"

const route = useRoute()
const session = useSessionStore()
const fontColor = ref<string>()

//@apply ris-link1-regular link-hover flex items-center gap-4 aria-[current=page]:underline aria-[current=page]:decoration-[0.1875rem];
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
        class="ris-link1-regular hover:underline ml-80"
        :class="
          route.path.includes('zurueckziehen') ? 'decoration-3' : 'no-underline'
        "
        :to="{ name: 'Withdraw' }"
        >Zurückziehen
      </router-link>
      <router-link
        class="ris-link1-regular hover:underline ml-80"
        :class="
          route.path.includes('uebersetzungenNormen')
            ? 'decoration-3'
            : 'no-underline'
        "
        :to="{ name: 'UebersetzungenNormen' }"
        >Übersetzungen Normen
      </router-link>
    </div>

    <div v-if="session.user" class="flex gap-8 pr-16">
      <IconPermIdentity />
      <div class="flex flex-row items-streach justify-start flex-nowrap pr-32">
        <div class="flex flex-col">{{ session.user?.name }}</div>
      </div>
    </div>
  </nav>
</template>

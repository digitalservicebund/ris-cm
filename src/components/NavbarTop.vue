<script lang="ts" setup>
import { ref } from "vue"
import { useRoute, RouterLink } from "vue-router"
import IconPermIdentity from "~icons/ic/baseline-perm-identity"
import { useAuthentication } from "@/lib/auth"

const route = useRoute()
const fontColor = ref<string>()

const { getUsername, getLogoutLink } = useAuthentication()
const logoutLink = getLogoutLink()
const username = getUsername()
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
          active-class="underline decoration-3"
          :to="{ name: 'uebersetzungen-normen' }"
          >Übersetzungen Normen
        </router-link>
      </div>
    </div>

    <div v-if="username" class="flex gap-8 pr-16">
      <IconPermIdentity />
      <div class="flex flex-row items-streach justify-start flex-nowrap">
        {{ username }}
      </div>
      <a :href="logoutLink" class="ris-link2-regular underline-offset-2">
        Abmelden
      </a>
    </div>
  </nav>
</template>

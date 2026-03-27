<script lang="ts" setup>
import { RouterLink } from "vue-router"
import UserInfo from "./UserInfo.vue"
</script>

<template>
  <nav
    class="flex items-center justify-between border-y border-gray-400 px-16 py-16 print:hidden"
  >
    <div class="flex items-center gap-[80px]">
      <div class="flex flex-col">
        <span aria-hidden="true" class="ris-body1-bold">
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

    <div class="pr-16">
      <UserInfo></UserInfo>
    </div>
  </nav>
</template>

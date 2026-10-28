<script setup lang="ts">
import { useAuthentication } from "@/lib/auth"
import IconPermIdentity from "~icons/ic/baseline-perm-identity"
import { ref } from "vue"
import Button from "./ui/Button.vue"

const { getUsername, getLogoutLink, getAccountLink, isConfigured } =
  useAuthentication()
const username = getUsername()
const userMenu = ref<boolean>(false)

function toggleUserMenu(event: MouseEvent) {
  userMenu.value = !userMenu.value
}
</script>

<template>
  <Button
    text
    v-if="isConfigured()"
    @click="toggleUserMenu"
    :label="username"
    style="text-decoration-line: none"
  >
    <template #icon><IconPermIdentity /></template>
  </Button>

  <div v-if="userMenu" class="absolute block bg-white">
    <Button as="a" class="w-full" severity="info" :href="getAccountLink()"
      >Konto verwalten (Bare.ID)</Button
    >
    <Button as="a" class="w-full" severity="info" :href="getLogoutLink()"
      >Ausloggen</Button
    >
  </div>
</template>

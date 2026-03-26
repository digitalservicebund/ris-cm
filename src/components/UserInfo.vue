<script setup lang="ts">
import { useAuthentication } from "@/lib/auth"
import IconPermIdentity from "~icons/ic/baseline-perm-identity"
import { computed, ref } from "vue"
import Menu from "primevue/menu"
import Button from "primevue/button"
import type { MenuItem } from "primevue/menuitem"

const { getUsername, getLogoutLink, getAccountLink, isConfigured } =
  useAuthentication()
const username = getUsername()
const userMenu = ref<any>()

function toggleUserMenu(event: MouseEvent) {
  userMenu.value?.toggle(event)
}

const userMenuIcons = computed<MenuItem[]>(() => [
  {
    label: "Konto verwalten (Bare.ID)",
    url: getAccountLink(),
  },
  {
    label: "Ausloggen",
    url: getLogoutLink(),
  },
])
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
  <Menu ref="userMenu" :model="userMenuIcons" popup />
</template>

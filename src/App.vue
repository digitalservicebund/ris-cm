<script setup lang="ts">
import { RouterView } from "vue-router"
import Navbar from "@/components/NavbarTop.vue"
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <Navbar />
    <Suspense>
      <router-view class="grow" />
    </Suspense>
  </div>
</template>

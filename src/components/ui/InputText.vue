<script setup lang="ts">
import { computed, useTemplateRef } from "vue"
import { tw } from "./tags"

const props = withDefaults(
  defineProps<{
    size?: "small" | "large"
  }>(),
  {
    size: "small",
  },
)

const model = defineModel<string>()

const inputRef = useTemplateRef<HTMLInputElement>("inputRef")

// The template ref is the underlying input, so consumers can focus it or set
// the selection range (see DataFieldPicker).
defineExpose({ input: inputRef })

defineOptions({ inheritAttrs: false })

// Classes ------------------------------------------------

const base = tw`[&+small]:typo-label2-regular border-2 border-blue-800 bg-white placeholder:text-gray-800 read-only:cursor-not-allowed read-only:border-blue-300 read-only:bg-blue-300 hover:outline-4 hover:-outline-offset-4 hover:outline-blue-800 focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-blue-800 disabled:border-blue-500 disabled:bg-white disabled:text-blue-500 disabled:outline-hidden aria-[invalid]:border-red-800 aria-[invalid]:bg-red-200 aria-[invalid]:outline-red-800 aria-[invalid]:disabled:outline-hidden [&+small]:mt-4 [&+small]:flex [&+small]:items-center [&+small]:gap-4 [&+small]:text-gray-900 [&[aria-invalid="true"]+small]:text-red-900`

const small = tw`typo-label2-regular h-48 px-16 py-4`

const large = tw`typo-label1-regular h-64 px-24 py-4`

// Combines the two size variants; used identically by both template branches
// below.
const inputClass = computed(() => ({
  [base]: true,
  [large]: props.size === "large",
  [small]: props.size === "small",
}))
</script>

<template>
  <input :class="inputClass" ref="inputRef" v-bind="$attrs" v-model="model" />
</template>

<style scoped>
/*
 * Remove the browser's native clear icon for search inputs. Its size, position
 * and hover styling differ per engine and it is absent in Firefox entirely, so
 * `clearable` provides a consistent replacement we fully control.
 */
input[type="search"]::-webkit-search-cancel-button {
  -webkit-appearance: none;
  appearance: none;
  display: none;
}
</style>

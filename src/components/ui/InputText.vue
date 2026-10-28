<script setup lang="ts">
import { computed, useAttrs, useTemplateRef, type StyleValue } from "vue"
import { tw } from "./tags"

const props = withDefaults(
  defineProps<{
    fluid?: boolean
    size?: "small" | "large"
  }>(),
  {
    fluid: false,
    size: "small",
  },
)

const model = defineModel<string>()

const emit = defineEmits<{
  clear: []
}>()

const inputRef = useTemplateRef<HTMLInputElement>("inputRef")

const attrs = useAttrs()

// The template ref is the underlying input, so consumers can focus it or set
// the selection range (see DataFieldPicker).
defineExpose({ input: inputRef })

defineOptions({ inheritAttrs: false })

// Attributes ---------------------------------------------

// `class` and `style` always target the root element, which is the wrapper when
// the clear button is rendered. Everything else goes to the input. Vue
// normalizes both before they reach `attrs`.
const rootClass = computed(() => attrs.class as string | undefined)

const rootStyle = computed(() => attrs.style as StyleValue)

const inputAttrs = computed(() => {
  const rest = { ...attrs }
  delete rest.class
  delete rest.style
  return rest
})

// Classes ------------------------------------------------

const base = tw`[&+small]:typo-label2-regular border-2 border-blue-800 bg-white placeholder:text-gray-800 read-only:cursor-not-allowed read-only:border-blue-300 read-only:bg-blue-300 hover:outline-4 hover:-outline-offset-4 hover:outline-blue-800 focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-blue-800 disabled:border-blue-500 disabled:bg-white disabled:text-blue-500 disabled:outline-hidden aria-[invalid]:border-red-800 aria-[invalid]:bg-red-200 aria-[invalid]:outline-red-800 aria-[invalid]:disabled:outline-hidden [&+small]:mt-4 [&+small]:flex [&+small]:items-center [&+small]:gap-4 [&+small]:text-gray-900 [&[aria-invalid="true"]+small]:text-red-900`

const small = tw`typo-label2-regular h-48 px-16 py-4`

const large = tw`typo-label1-regular h-64 px-24 py-4`

const clearButtonFocus = tw`group-has-[button:focus-visible]/input:outline-4 group-has-[button:focus-visible]/input:-outline-offset-4 not-aria-[invalid]:group-has-[button:focus-visible]/input:outline-blue-800`

// Combines the two size variants and the clear-button-related adjustments;
// used identically by both template branches below.
const inputClass = computed(() => ({
  [base]: true,
  [large]: props.size === "large",
  [small]: props.size === "small",
  "w-full": props.fluid,
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

<script setup lang="ts">
import { computed, useSlots, type Component } from "vue"
import { tw } from "./tags"

const props = withDefaults(
  defineProps<{
    as?: string | Component
    disabled?: boolean
    label?: string
    severity?: "primary" | "secondary" | "info"
    size?: "small" | "normal"
    text?: boolean
    type?: "button" | "submit" | "reset"
  }>(),
  {
    as: "button",
    disabled: false,
    label: undefined,
    severity: "primary",
    size: "normal",
    text: false,
    type: "button",
  },
)

const slots = useSlots()

const isNativeButton = computed(() => props.as === "button")

const hasLabel = computed(() => props.label != null || slots.default != null)

const iconOnly = computed(() => slots.icon != null && !hasLabel.value)

// Classes ------------------------------------------------

const base = tw`relative inline-flex max-w-full cursor-pointer items-center justify-center gap-8 text-center focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-blue-800 focus-visible:not-focus-visible:outline-none active:outline-none disabled:cursor-not-allowed disabled:outline-hidden`

const primary = tw`bg-blue-800 text-white hover:bg-blue-700 active:bg-blue-500 active:text-blue-800 disabled:bg-gray-400 disabled:text-gray-600`

const secondary = tw`border-2 border-blue-800 bg-white text-blue-800 hover:bg-blue-200 focus-visible:bg-blue-200 active:bg-blue-400 disabled:border-blue-500 disabled:text-blue-500 disabled:hover:bg-white`

const info = tw`border border-blue-500 bg-white text-blue-800 hover:bg-gray-200 focus-visible:bg-gray-200 active:border-white active:bg-white disabled:border-blue-500 disabled:text-blue-500 disabled:hover:bg-white`

const primaryText = tw`border-2 border-transparent bg-transparent text-blue-800 underline hover:border-gray-500 hover:bg-white focus-visible:border-gray-500 active:border-blue-600 active:bg-blue-400 disabled:border-transparent disabled:bg-transparent disabled:text-gray-500`

const sizeClass = computed(() => {
  const { severity } = props
  const pad = iconOnly.value
    ? { small: tw`w-40 px-4`, normal: tw`w-48 px-4` }
    : { small: tw`px-12`, normal: tw`px-16` }

  return {
    small: tw`${severity === "info" ? "typo-label2-regular" : "typo-label2-bold"} h-40 py-4 ${pad.small}`,
    normal: tw`typo-label2-bold h-48 py-4 ${pad.normal}`,
  }
})

const rootClass = computed(() => {
  const { severity, size, text } = props
  const sizes = sizeClass.value

  return {
    [base]: true,
    [sizes.small]: size === "small",
    [sizes.normal]: size === "normal",
    [primary]: !text && severity === "primary",
    [secondary]: !text && severity === "secondary",
    [info]: !text && severity === "info",
    [primaryText]: text && severity === "primary",
  }
})
</script>

<template>
  <component
    :class="rootClass"
    :disabled="isNativeButton ? disabled : undefined"
    :is="as"
    :type="isNativeButton ? type : undefined"
  >
    <slot name="icon" />
    <span v-if="hasLabel">
      <slot>{{ label }}</slot>
    </span>
  </component>
</template>

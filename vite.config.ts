import vue from "@vitejs/plugin-vue"
import { fileURLToPath, URL } from "node:url"
import icons from "unplugin-icons/vite"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    base: "/",
    build: {
      sourcemap: true,
    },
    plugins: [
      vue(),
      icons({
        scale: 1.3333, // ~24px at the current default font size of 18px
        compiler: "vue3",
      }),
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  }
})

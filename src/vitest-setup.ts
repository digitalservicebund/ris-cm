import "@testing-library/jest-dom/vitest"
import { config } from "@vue/test-utils"
import PrimeVue from "primevue/config"

config.global.plugins = [PrimeVue]

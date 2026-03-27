import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"
import "@/styles/global.css"
import { RisUiLocale } from "@digitalservicebund/ris-ui/primevue"
import PrimeVue from "primevue/config"
import "@digitalservicebund/ris-ui/fonts.css"
import CaselawUiTheme from "@/theme"
import { useAuthentication } from "./lib/auth"
import { getEnv } from "@/lib/env"
import { useFavicon } from "@vueuse/core"
import { getFavicon } from "@/lib/favicon"
import { Sentry } from "@/lib/sentry"

try {
  const env = await getEnv()

  // Initialize Vue application
  const app = createApp(App)
    .use(router)
    .use(PrimeVue, {
      unstyled: true,
      pt: CaselawUiTheme,
      locale: RisUiLocale.deDE,
    })
    .use(Sentry, { env, router })

  if (env.auth) {
    const auth = useAuthentication()
    await auth.configure(env.auth)
  }

  useFavicon(getFavicon(env.environment))

  // If all initialization succeeds, mount app
  app.mount("#app")
} catch (e: unknown) {
  // If an error occurs above, catch it here
  console.error(e)

  // Get references to the error message container and the loading message
  const errorContainer = document.getElementById("error-container")
  const loadingMessage = document.querySelector(".fallback p")

  if (errorContainer) {
    errorContainer.removeAttribute("hidden")
    if (loadingMessage) {
      loadingMessage.setAttribute("hidden", "true")
    }
    if (e instanceof Error) {
      const errorDetails = errorContainer.querySelector("#error-detail")
      if (errorDetails) {
        errorDetails.textContent = e.message
      }
    }
  }
}

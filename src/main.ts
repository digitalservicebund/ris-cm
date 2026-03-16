import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"
import "./style.css"

try {
  // Initialize Vue application
  const app = createApp(App).use(router)

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

import {
  browserTracingIntegration,
  captureConsoleIntegration,
  init,
} from "@sentry/vue"
import type { Plugin } from "vue"
import type { Router } from "vue-router"
import type { Env } from "@/lib/env"

export const Sentry: Plugin<{ env: Env; router: Router }> = {
  install(app, { env, router }) {
    if (!env.sentry) {
      console.info(`Sentry reporting is disabled`)
      return
    }

    console.info(
      `Sentry reporting is enabled in environment "${env.sentry.environment}"`,
    )

    init({
      app,
      integrations: [
        browserTracingIntegration({ router }),
        captureConsoleIntegration(),
      ],
      attachProps: true,
      ...env.sentry,
    })
  },
}

import localFavicon from "@/assets/favicon-local.svg"
import productionFavicon from "@/assets/favicon-production.svg"
import stagingFavicon from "@/assets/favicon-staging.svg"
import uatFavicon from "@/assets/favicon-uat.svg"

export const getFavicon = (
  env?: "local" | "staging" | "uat" | "production",
) => {
  switch (env) {
    case "local":
      return localFavicon
    case "staging":
      return stagingFavicon
    case "uat":
      return uatFavicon
    case "production":
      return productionFavicon
  }

  console.error("Unknown env: ", env)

  return productionFavicon
}

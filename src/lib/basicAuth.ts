const STORAGE_KEY = "portalBasicAuthCredentials"

interface Credentials {
  username: string
  password: string
}

/**
 * Reads previously stored basic-auth credentials from `localStorage`, if any.
 *
 * @returns The stored credentials, or `undefined` if none are stored (or
 *  they can't be parsed).
 */
function getCredentials(): Credentials | undefined {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return undefined

  try {
    return JSON.parse(raw) as Credentials
  } catch {
    return undefined
  }
}

/**
 * Persists basic-auth credentials to `localStorage`.
 *
 * @param credentials Credentials to store
 */
function storeCredentials(credentials: Credentials): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials))
}

/**
 * Removes any stored basic-auth credentials from `localStorage`.
 */
function clearCredentials(): void {
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * Prompts the user for a username and password using the browser's native
 * `window.prompt`. If the user cancels either prompt, `undefined` is
 * returned instead of partial credentials.
 *
 * @returns The entered credentials, or `undefined` if the user cancelled.
 */
function promptCredentials(): Credentials | undefined {
  const username = window.prompt("Benutzername für den Portal-Zugriff:")
  if (!username) return undefined

  const password = window.prompt("Passwort für den Portal-Zugriff:")
  if (!password) return undefined

  return { username, password }
}

function toAuthorizationHeader(credentials: Credentials): string {
  const raw = `${credentials.username}:${credentials.password}`
  return `Basic ${btoa(raw)}`
}

/**
 * Performs a `fetch` request with an `Authorization: Basic ...` header,
 * using stored credentials or prompting the user for them if none are
 * stored yet. If the server responds with `401`, stored credentials are
 * cleared, the user is prompted again, and the request is retried exactly
 * once.
 *
 * @param url URL to fetch
 * @param init Optional fetch options; any `headers` provided will be merged
 *  with the `Authorization` header.
 * @returns The fetch `Response`
 * @throws Error if the user cancels the credential prompt
 */
async function fetchWithBasicAuth(
  url: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  let credentials = getCredentials()
  if (!credentials) {
    credentials = promptCredentials()
    if (!credentials) {
      throw new Error("Basic auth credentials are required")
    }
    storeCredentials(credentials)
  }

  const response = await fetch(url, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: toAuthorizationHeader(credentials),
    },
  })

  if (response.status !== 401) {
    return response
  }

  clearCredentials()
  const retryCredentials = promptCredentials()
  if (!retryCredentials) {
    throw new Error("Basic auth credentials are required")
  }
  storeCredentials(retryCredentials)

  return fetch(url, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: toAuthorizationHeader(retryCredentials),
    },
  })
}

export {
  clearCredentials,
  fetchWithBasicAuth,
  getCredentials,
  promptCredentials,
  storeCredentials,
}

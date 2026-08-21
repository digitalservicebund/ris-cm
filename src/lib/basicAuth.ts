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
 * Performs a single fetch attempt with the given credentials attached as an
 * `Authorization: Basic ...` header.
 *
 * Because `Authorization` is a non-simple header, the browser will send a
 * CORS preflight (`OPTIONS`) request first. If the server rejects that
 * preflight (e.g. because it also requires authentication for `OPTIONS`,
 * or otherwise fails the CORS checks), `fetch` doesn't resolve with a
 * `401` response at all - it rejects with a generic network error (e.g.
 * `TypeError: Failed to fetch`). To treat that the same as an
 * authentication failure, such errors are caught and represented as a
 * synthetic `401` response.
 *
 * @param url URL to fetch
 * @param init Optional fetch options
 * @param credentials Credentials to authenticate with
 * @returns The fetch `Response`, or a synthetic `401` response if the
 *  request failed (e.g. due to a CORS/auth-related network error).
 */
async function attemptFetch(
  url: RequestInfo | URL,
  init: RequestInit | undefined,
  credentials: Credentials,
): Promise<Response> {
  try {
    return await fetch(url, {
      ...init,
      headers: {
        ...init?.headers,
        Authorization: toAuthorizationHeader(credentials),
      },
    })
  } catch {
    return new Response(null, { status: 401 })
  }
}

/**
 * Performs a `fetch` request with an `Authorization: Basic ...` header,
 * using stored credentials or prompting the user for them if none are
 * stored yet. If the server responds with `401` - or the request fails
 * outright, e.g. because a CORS preflight was rejected due to bad
 * credentials - stored credentials are cleared, the user is prompted
 * again, and the request is retried exactly once.
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

  const response = await attemptFetch(url, init, credentials)

  if (response.status !== 401) {
    return response
  }

  clearCredentials()
  const retryCredentials = promptCredentials()
  if (!retryCredentials) {
    throw new Error("Basic auth credentials are required")
  }
  storeCredentials(retryCredentials)

  return attemptFetch(url, init, retryCredentials)
}

export {
  clearCredentials,
  fetchWithBasicAuth,
  getCredentials,
  promptCredentials,
  storeCredentials,
}

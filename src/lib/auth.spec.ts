import Keycloak from "keycloak-js"
import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("keycloak-js", () => {
  const MockKeycloak = vi.fn<() => Keycloak>()
  MockKeycloak.prototype.init = vi
    .fn<() => Promise<boolean>>()
    .mockResolvedValue(true)
  MockKeycloak.prototype.didInitialize = false
  MockKeycloak.prototype.token = undefined
  MockKeycloak.prototype.idTokenParsed = undefined
  MockKeycloak.prototype.createLogoutUrl = vi
    .fn<() => string>()
    .mockReturnValue("/logout")
  MockKeycloak.prototype.updateToken = vi
    .fn<() => Promise<boolean>>()
    .mockResolvedValue(true)

  return { default: MockKeycloak }
})

describe("auth", () => {
  afterEach(() => {
    vi.resetAllMocks()
    vi.resetModules()
  })

  it("configures a new instance", async () => {
    const { useAuthentication } = await import("./auth")
    const { configure } = useAuthentication()

    await configure({
      clientId: "test-client",
      realm: "test-realm",
      url: "https://oauth-url.test",
    })

    expect(Keycloak).toHaveBeenCalledExactlyOnceWith({
      clientId: "test-client",
      realm: "test-realm",
      url: "https://oauth-url.test",
    })

    expect(Keycloak.prototype.init).toHaveBeenCalled()
  })

  it("replaces an existing instance when configuring again", async () => {
    const { useAuthentication } = await import("./auth")
    const { configure } = useAuthentication()

    await configure({
      clientId: "test-client-1",
      realm: "test-realm-1",
      url: "https://oauth-url.test/1",
    })

    await configure({
      clientId: "test-client-2",
      realm: "test-realm-2",
      url: "https://oauth-url.test/2",
    })

    expect(Keycloak).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ clientId: "test-client-1" }),
    )
    expect(Keycloak).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ clientId: "test-client-2" }),
    )

    expect(Keycloak.prototype.init).toHaveBeenCalledTimes(2)
  })

  it("throws an error when configuration fails", async () => {
    vi.spyOn(Keycloak.prototype, "init").mockRejectedValueOnce("Error")
    const { useAuthentication } = await import("./auth")
    const { configure } = useAuthentication()

    await expect(() =>
      configure({
        clientId: "test-client",
        realm: "test-realm",
        url: "https://oauth-url.test",
      }),
    ).rejects.toThrow(expect.objectContaining({ cause: "Error" }))
  })

  it("returns that it is configured", async () => {
    const { useAuthentication } = await import("./auth")
    const { configure, isConfigured } = useAuthentication()

    await configure({
      clientId: "test-client",
      realm: "test-realm",
      url: "https://oauth-url.test",
    })

    expect(isConfigured()).toBe(false)
  })

  it("returns that it is not configured", async () => {
    const { useAuthentication } = await import("./auth")
    const { isConfigured } = useAuthentication()

    expect(isConfigured()).toBe(false)
  })

  it("adds an authorization header when a token is available", async () => {
    vi.spyOn(Keycloak.prototype, "token", "get").mockReturnValue("1234")
    const { useAuthentication } = await import("./auth")
    const { configure, addAuthorizationHeader } = useAuthentication()

    await configure({
      clientId: "test-client",
      realm: "test-realm",
      url: "https://oauth-url.test",
    })

    const headers = addAuthorizationHeader()

    // @ts-expect-error TypeScript is not sure it's there, but that's what we're testing
    expect(headers.Authorization).toBe("Bearer 1234")
  })

  it("doesn't add an authorization header when no token is available", async () => {
    vi.spyOn(Keycloak.prototype, "token", "get").mockReturnValue(undefined)
    const { useAuthentication } = await import("./auth")
    const { addAuthorizationHeader } = useAuthentication()

    const headers = addAuthorizationHeader()

    // @ts-expect-error TypeScript is not sure it's there, but that's what we're testing
    expect(headers.Authorization).toBeFalsy()
  })

  it("includes the original headers when adding an authorization header", async () => {
    vi.spyOn(Keycloak.prototype, "token", "get").mockReturnValue("1234")
    const { useAuthentication } = await import("./auth")
    const { configure, addAuthorizationHeader } = useAuthentication()

    await configure({
      clientId: "test-client",
      realm: "test-realm",
      url: "https://oauth-url.test",
    })

    const headers = addAuthorizationHeader({ test: "true" })

    // @ts-expect-error TypeScript is not sure it's there, but that's what we're testing
    expect(headers.test).toBe("true")
  })

  it("returns the username", async () => {
    vi.spyOn(Keycloak.prototype, "idTokenParsed", "get").mockReturnValue({
      name: "Jane Doe",
    })
    const { useAuthentication } = await import("./auth")
    const { configure, getUsername } = useAuthentication()

    await configure({
      clientId: "test-client",
      realm: "test-realm",
      url: "https://oauth-url.test",
    })

    const username = getUsername()

    expect(username).toBe("Jane Doe")
  })

  it("returns undefined as the username if no token exists", async () => {
    vi.spyOn(Keycloak.prototype, "idTokenParsed", "get").mockReturnValue(
      undefined,
    )
    const { useAuthentication } = await import("./auth")
    const { configure, getUsername } = useAuthentication()

    await configure({
      clientId: "test-client",
      realm: "test-realm",
      url: "https://oauth-url.test",
    })

    const username = getUsername()

    expect(username).toBeUndefined()
  })

  it("returns a logout link", async () => {
    vi.spyOn(Keycloak.prototype, "createLogoutUrl").mockReturnValue(
      "http://example.com",
    )

    const { useAuthentication } = await import("./auth")
    const { configure, getLogoutLink } = useAuthentication()

    await configure({
      clientId: "test-client",
      realm: "test-realm",
      url: "https://oauth-url.test",
    })

    const logoutLink = getLogoutLink()

    expect(logoutLink).toBe("http://example.com")
  })

  it("returns false when attempting to refresh a token before configuring auth", async () => {
    const { useAuthentication } = await import("./auth")
    const { tryRefresh } = useAuthentication()

    const result = await tryRefresh()

    expect(result).toBe(false)
  })

  it("returns false when the token refresh throws", async () => {
    vi.spyOn(Keycloak.prototype, "updateToken").mockImplementation(() => {
      throw new Error()
    })

    const { useAuthentication } = await import("./auth")
    const { tryRefresh, configure } = useAuthentication()

    await configure({
      clientId: "test-client",
      realm: "test-realm",
      url: "https://oauth-url.test",
    })

    const result = await tryRefresh()

    expect(result).toBe(false)
  })

  it("returns true when the token refresh succeeds", async () => {
    vi.spyOn(Keycloak.prototype, "updateToken").mockResolvedValue(true)
    const { useAuthentication } = await import("./auth")
    const { tryRefresh, configure } = useAuthentication()

    await configure({
      clientId: "test-client",
      realm: "test-realm",
      url: "https://oauth-url.test",
    })

    const result = await tryRefresh()

    expect(result).toBe(true)
  })

  it("returns true when the token doesn't need refreshing", async () => {
    vi.spyOn(Keycloak.prototype, "updateToken").mockResolvedValue(false)
    const { useAuthentication } = await import("./auth")
    const { tryRefresh, configure } = useAuthentication()

    await configure({
      clientId: "test-client",
      realm: "test-realm",
      url: "https://oauth-url.test",
    })

    const result = await tryRefresh()

    expect(result).toBe(true)
  })

  it("doesn't run multiple token refresh requests at the same time", async () => {
    vi.spyOn(Keycloak.prototype, "updateToken").mockResolvedValue(true)

    const { useAuthentication } = await import("./auth")
    const { tryRefresh, configure } = useAuthentication()

    await configure({
      clientId: "test-client",
      realm: "test-realm",
      url: "https://oauth-url.test",
    })

    const result1 = tryRefresh()
    const result2 = tryRefresh()

    await expect(result1).resolves.toBe(true)
    await expect(result2).resolves.toBe(true)
    expect(Keycloak.prototype.updateToken).toHaveBeenCalledTimes(1)
  })

  it("runs multiple token refresh requests sequentially", async () => {
    vi.spyOn(Keycloak.prototype, "updateToken").mockResolvedValue(true)

    const { useAuthentication } = await import("./auth")
    const { tryRefresh, configure } = useAuthentication()

    await configure({
      clientId: "test-client",
      realm: "test-realm",
      url: "https://oauth-url.test",
    })

    const result1 = tryRefresh()
    await expect(result1).resolves.toBe(true)
    expect(Keycloak.prototype.updateToken).toHaveBeenCalledTimes(1)

    const result2 = tryRefresh()
    await expect(result2).resolves.toBe(true)
    expect(Keycloak.prototype.updateToken).toHaveBeenCalledTimes(2)
  })
})

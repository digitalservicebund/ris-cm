# 5. Use OAuth2 with PKCE for authentication

Date: 2026-03-25

## Status

Accepted

## Context

Out application is only serving a frontend. We will need to authenticate our users against multiple different backend services.

## Decision

We have decided to implement OAuth2 for authentication. In detail this means:

**Our frontend application will serve as a OAuth2 client while the backend serves as a resource server.** Thus, Keycloak regains control over application access. A token will expire after 5 minutes, reducing the impact on theft while still keeping the app usable. The lifetime can be reduced further if necessary.

**We will use the OAuth2 authentication code flow with PKCE.** [PKCE](https://www.oauth.com/oauth2-servers/pkce/) is a suitable flow for our application, which is implemented as a [Single Page Application.](https://www.oauth.com/oauth2-servers/single-page-apps/) As such, it is not a confidential client and cannot contain secrets.

**We will use Keycloak.js as the client library.** [Keycloak.js](https://github.com/keycloak/keycloak-js) is lightweight, focused on what we need, and directly maintained by RedHat, the developers of Keycloak.

**The backend services will use the [Spring Boot standard library for OAuth2 Resource Servers.](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/index.html)** This libary is recommended by the Keycloak developers.

**We use JSON Web Tokens (JWTs).** JWTs are well-supported and self-contained, reducing implementation complexity and network calls. There is no sensitive data in the tokens we would have to obfuscate.

## Consequences

- The frontend needs to be publicly accessible.

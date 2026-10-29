FROM node:26.12 AS builder
WORKDIR /src
# Required files are whitelisted in dockerignore
COPY . ./
ARG SENTRY_RELEASE="no-release-information"
ENV SENTRY_RELEASE=$SENTRY_RELEASE
RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN \
    if [ -f /run/secrets/SENTRY_AUTH_TOKEN ]; then \
        export SENTRY_AUTH_TOKEN=$(cat /run/secrets/SENTRY_AUTH_TOKEN); \
    fi; \
    npm ci --ignore-scripts && npm run build && npm prune --production

FROM cgr.dev/chainguard/nginx@sha256:16d0e55ffe62f55744d9b903d8eb57e533d0f660332a9fbb967d78b4e77c8bdb
COPY --from=builder /src/dist /usr/share/nginx/html/
COPY nginx /etc/nginx/conf.d/
EXPOSE 8080

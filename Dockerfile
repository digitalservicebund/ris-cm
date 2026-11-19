FROM node:26.13 AS builder
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

FROM cgr.dev/chainguard/nginx@sha256:d660885b01f715c21d4bcece4457bef7440cbc8d349b8d5931900cb08b935bdc
COPY --from=builder /src/dist /usr/share/nginx/html/
COPY nginx /etc/nginx/conf.d/
EXPOSE 8080

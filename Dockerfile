FROM node:26.9 AS builder
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

FROM cgr.dev/chainguard/nginx@sha256:51048009c0db8c584a3746a98368295fa2c13ad1b29e5c846a5d3da9dd9b35c4
COPY --from=builder /src/dist /usr/share/nginx/html/
COPY nginx /etc/nginx/conf.d/
EXPOSE 8080

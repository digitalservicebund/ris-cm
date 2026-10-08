FROM node:26.10 AS builder
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

FROM cgr.dev/chainguard/nginx@sha256:4d1a034e20cf62edc65b279e83025deec3dfb38bee92cde9e5d51b44752fd7f9
COPY --from=builder /src/dist /usr/share/nginx/html/
COPY nginx /etc/nginx/conf.d/
EXPOSE 8080

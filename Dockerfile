FROM node:24.11.1 AS builder
WORKDIR /src
# Required files are whitelisted in dockerignore
COPY . ./
RUN npm ci --ignore-scripts && npm run build && npm prune --production

FROM cgr.dev/chainguard/nginx@sha256:e6654b6c60849adfb20dc1c69c8556c5a4b63afe6930dbf82b45ee3269ede875
COPY --from=builder /src/dist /usr/share/nginx/html/
COPY nginx /etc/nginx/conf.d/
EXPOSE 8080

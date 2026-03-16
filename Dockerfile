FROM node:24-alpine AS build

ARG COMMIT_SHA
ENV APP_VERSION=$COMMIT_SHA

# Create app directory
WORKDIR /src
# Required files are whitelisted in dockerignore
COPY . ./
RUN npm ci --ignore-scripts && npm run build && npm prune --production

# Copy the static assets to the nginx image
FROM nginxinc/nginx-unprivileged:1.29-alpine3.22
COPY --from=build /src/dist /usr/share/nginx/html/

# Replace the default server configuration of the base nginx image.
COPY nginx /etc/nginx/conf.d/
EXPOSE 8080
# == Stage 1: Build ==
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# == Stage 2: Serve ==
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/nginx.conf.template

# Default to port 80 (Kubernetes Service port).
# Override to 8080 for Docker Compose (container-to-container).
ENV BACKEND_PORT=80

EXPOSE 80

# envsubst only replaces $BACKEND_PORT, leaving nginx variables ($uri etc.) intact
CMD ["/bin/sh", "-c", "envsubst '${BACKEND_PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]

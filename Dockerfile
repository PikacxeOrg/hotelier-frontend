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

# DNS resolver: 127.0.0.11 for Docker, kube-dns IP for Kubernetes.
ENV DNS_RESOLVER=127.0.0.11

EXPOSE 80

# envsubst replaces $BACKEND_PORT and $DNS_RESOLVER, leaving nginx variables ($uri etc.) intact
CMD ["/bin/sh", "-c", "envsubst '${BACKEND_PORT} ${DNS_RESOLVER}' < /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]

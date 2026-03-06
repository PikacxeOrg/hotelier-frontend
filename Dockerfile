# == Stage 1: Build ==
FROM node:22-alpine AS build
ARG VERSION=1.0.0
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN VITE_APP_VERSION=$VERSION npm run build

# == Stage 2: Serve ==
FROM nginx:alpine

ARG NGINX_CONF=nginx.conf.prod
ENV NGINX_CONF=${NGINX_CONF}

COPY --from=build /app/dist /usr/share/nginx/html
COPY ${NGINX_CONF} /etc/nginx/conf.d/default.conf
COPY cors.conf /etc/nginx/cors.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

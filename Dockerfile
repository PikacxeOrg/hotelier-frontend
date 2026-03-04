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

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/conf.d/default.conf
COPY cors.conf /etc/nginx/cors.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL
ARG VITE_FRONTEND_HOST
ARG VITE_FRONTEND_PORT
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_GOOGLE_MAPS_API_KEY

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_FRONTEND_HOST=${VITE_FRONTEND_HOST}
ENV VITE_FRONTEND_PORT=${VITE_FRONTEND_PORT}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}
ENV VITE_GOOGLE_MAPS_API_KEY=${VITE_GOOGLE_MAPS_API_KEY}

RUN test -n "$VITE_API_URL" \
 && test -n "$VITE_GOOGLE_CLIENT_ID" \
 && test -n "$VITE_GOOGLE_MAPS_API_KEY" \
 && npm run build

FROM nginxinc/nginx-unprivileged:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]

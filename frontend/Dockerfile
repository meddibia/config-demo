FROM oven/bun:1.1.27-slim AS builder

WORKDIR /app

COPY package.json bun.lockb* ./
RUN bun install

COPY . .
ENV VITE_API_URL="http://backend:8000"
RUN bun run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# COPY default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

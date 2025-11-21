# syntax=docker/dockerfile:1
FROM node:22-alpine AS builder
WORKDIR /app
COPY ../frontend/package.json ../frontend/pnpm-lock.yaml* ./
RUN npm install -g pnpm@9
RUN pnpm install --frozen-lockfile
COPY ../frontend .
RUN pnpm build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY ../frontend/package.json ./package.json
RUN npm install -g pnpm@9 && pnpm install --prod --frozen-lockfile
ENV PORT=3000
EXPOSE 3000
CMD ["pnpm", "start"]

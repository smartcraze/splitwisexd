FROM oven/bun:alpine
WORKDIR /app
COPY package.json bun.lock* ./
COPY turbo.json ./

COPY packages/ ./packages/

COPY apps/backend/ ./apps/backend/

RUN bun install

WORKDIR /app/apps/backend

EXPOSE 3001

RUN bun run build
 CMD [ "bun","run","start" ]
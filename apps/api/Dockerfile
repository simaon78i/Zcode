FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache libc6-compat

RUN npm install -g pnpm

COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/games-sdk/package.json ./packages/games-sdk/

RUN pnpm install --no-frozen-lockfile

COPY apps/api ./apps/api
COPY packages/games-sdk ./packages/games-sdk

WORKDIR /app/apps/api

ENV PORT=8080
EXPOSE 8080

CMD ["npx", "tsx", "src/index.ts"]
FROM node:22-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/games-sdk/package.json ./packages/games-sdk/

RUN pnpm install --no-frozen-lockfile

COPY apps/api ./apps/api
COPY packages/games-sdk ./packages/games-sdk

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["npx", "tsx", "src/index.ts"]
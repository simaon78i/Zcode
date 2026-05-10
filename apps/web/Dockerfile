FROM node:22-alpine AS builder

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app
RUN npm install -g pnpm

COPY package.json pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/games-sdk/package.json ./packages/games-sdk/

RUN pnpm install --no-frozen-lockfile

COPY apps/web ./apps/web
COPY packages/games-sdk ./packages/games-sdk

WORKDIR /app/apps/web
RUN pnpm vite build

FROM nginx:alpine
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
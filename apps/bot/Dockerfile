FROM node:21-alpine AS base

FROM base AS builder
RUN apk add --no-cache libc6-compat
RUN apk update
RUN yarn set version canary
RUN yarn config set nodeLinker node-modules

WORKDIR /app
COPY . .
RUN yarn dlx turbo prune @datamine/bot --docker

FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app

COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN yarn install

COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

RUN yarn turbo build --filter=bot...
RUN yarn workspace @datamine/database run drizzle

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 datamine
RUN adduser --system --uid 1001 datamine
USER datamine
COPY --from=installer /app .

CMD node apps/bot/dist/main.js

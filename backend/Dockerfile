FROM node:22-alpine AS base

WORKDIR /app

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV CI=true
ENV PNPM_CONFIG_DANGEROUSLY_ALLOW_ALL_BUILDS=true

RUN apk add --no-cache \
    libc6-compat \
    build-base \
    openssl

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# --------------------
# DEV
# --------------------
FROM base AS dev

RUN pnpm config set minimum-release-age 0
RUN pnpm install

COPY . .

RUN pnpm prisma generate

EXPOSE 3000

CMD ["pnpm", "dev"]

# --------------------
# PROD BUILD
# --------------------
FROM base AS build

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm prisma generate
RUN pnpm build

# --------------------
# PROD RUNTIME
# --------------------
FROM node:22-alpine AS prod

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --prod --frozen-lockfile

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000

CMD ["pnpm", "start"]
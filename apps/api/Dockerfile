# syntax=docker/dockerfile:1
# El contexto de build es la raíz del repositorio:
#   docker build -f apps/api/Dockerfile .

FROM node:26.13.1-alpine@sha256:6bd9ab43c0ec0190ca7b2d193906cb8b7edf6e7f4afa43ddeccd6452710bffb5 AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable pnpm
WORKDIR /app

FROM base AS build
# Primero solo los manifiestos, para aprovechar la caché de dependencias
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter @devjobs/api...

COPY packages/shared packages/shared
COPY apps/api apps/api
RUN pnpm --filter @devjobs/api build

# Copia autocontenida de la API con solo sus dependencias de producción
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm --filter @devjobs/api deploy --prod /prod/api

FROM node:26.13.1-alpine@sha256:6bd9ab43c0ec0190ca7b2d193906cb8b7edf6e7f4afa43ddeccd6452710bffb5 AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/data/jobs.db
WORKDIR /app

RUN mkdir /data && chown node:node /data

COPY --from=build --chown=node:node /prod/api/package.json ./
COPY --from=build --chown=node:node /prod/api/node_modules ./node_modules
COPY --from=build --chown=node:node /prod/api/dist ./dist

USER node
VOLUME /data
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "dist/server.js"]

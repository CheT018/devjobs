# syntax=docker/dockerfile:1
# El contexto de build es la raíz del repositorio:
#   docker build -f apps/web/Dockerfile .

FROM node:26.13.1-alpine@sha256:6bd9ab43c0ec0190ca7b2d193906cb8b7edf6e7f4afa43ddeccd6452710bffb5 AS build
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable pnpm
WORKDIR /app

# Primero solo los manifiestos, para aprovechar la caché de dependencias
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter @devjobs/web...

COPY packages/shared packages/shared
COPY apps/web apps/web
RUN pnpm --filter @devjobs/web build

# nginx sin privilegios: el proceso no corre como root y escucha en el 8080
FROM nginx/nginx-unprivileged:1.30.8-alpine@sha256:637c35e46af7bc0dd3d3bcf7162e004e13ab3b370fde7cd416e2ac410b5a985a AS runner
ENV API_URL=http://api:3000

COPY apps/web/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/apps/web/dist /usr/share/nginx/html

EXPOSE 8080

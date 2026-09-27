# Build from the repo root:
#   docker build -f apps/api/Dockerfile -t nina-api .
FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/exercise-engine/package.json packages/exercise-engine/package.json

RUN pnpm install --frozen-lockfile --filter @nina/api... --filter @nina/db --filter @nina/contracts --filter @nina/exercise-engine

COPY apps/api apps/api
COPY packages/contracts packages/contracts
COPY packages/config packages/config
COPY packages/db packages/db
COPY packages/exercise-engine packages/exercise-engine

# prisma generate reads these from the schema and does not connect.
# Railway replaces them at runtime.
RUN DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build" \
    DATABASE_URL_UNPOOLED="postgresql://build:build@127.0.0.1:5432/build" \
    pnpm --filter @nina/contracts build \
    && pnpm --filter @nina/exercise-engine build \
    && pnpm --filter @nina/db build \
    && pnpm --filter @nina/api build

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4000
ENV STORAGE_ROOT=/data
EXPOSE 4000

CMD ["sh", "-c", "node packages/db/scripts/migrate.mjs && node apps/api/dist/server.js"]

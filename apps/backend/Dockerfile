# --- deps
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json turbo.json ./
COPY apps/backend/package.json apps/backend/
COPY packages/databases/package.json packages/databases/
COPY packages/typescript-config/package.json packages/typescript-config/
RUN npm ci

# --- build everything (simple + reliable)
FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm run build

# --- runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# copy built backend and needed node_modules, prisma schema
COPY --from=build /app/apps/backend/dist apps/backend/dist
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/packages/databases/node_modules packages/databases/node_modules
COPY --from=build /app/packages/databases/prisma packages/databases/prisma
COPY apps/backend/package.json apps/backend/
COPY packages/databases/package.json packages/databases/
COPY turbo.json package.json ./
# Run prisma generate + migrate then start server
CMD ["sh", "-c", "npx prisma generate --schema packages/databases/prisma/schema.prisma && npx prisma migrate deploy --schema packages/databases/prisma/schema.prisma && node apps/backend/dist/index.js"]

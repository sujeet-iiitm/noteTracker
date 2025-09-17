FROM node:20-bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y \
  openssl \
  netcat-openbsd \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json turbo.json ./
COPY apps/backend/package.json apps/backend/
COPY packages/databases/package.json packages/databases/
COPY packages/typescript-config/package.json packages/typescript-config/

# Install dependencies
RUN npm install
RUN npm install -g typescript prisma

# Copy the full monorepo
COPY . .

# Generate Prisma client (works without DB)
RUN npx prisma generate --schema=/app/packages/databases/prisma/schema.prisma

WORKDIR /app/apps/backend

EXPOSE 3000

# Copy helper scripts
COPY wait-for-db.sh /app/wait-for-db.sh
COPY apps/backend/scripts/start.sh ./start.sh
RUN chmod +x /app/wait-for-db.sh ./start.sh

# Run migrations + start API at container startup
# (not during build!)
CMD ["/bin/sh", "-c", "/app/wait-for-db.sh && npx prisma migrate deploy --schema=/app/packages/databases/prisma/schema.prisma && npm run dev"]

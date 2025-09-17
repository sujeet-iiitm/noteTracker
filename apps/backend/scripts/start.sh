#!/bin/sh
set -e

echo "⏳ Waiting for Postgres..."
npx wait-on tcp:db:5432

echo "✅ Running Prisma migrations..."
npx prisma migrate deploy --schema=/app/packages/databases/prisma/schema.prisma

echo "🚀 Starting backend..."
npm run dev --workspace=@notes/api

#!/bin/sh
set -e

echo "⏳ Waiting for Postgres at $DATABASE_URL..."

until nc -z db 5432; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 2
done

>&2 echo "✅ Postgres is up - running migrations"

npx prisma migrate deploy --schema=/app/packages/databases/prisma/schema.prisma

exec "$@"

#!/bin/sh
set -e

echo "Waiting for database to be ready..."

# Use environment variables from docker-compose
DB_HOST="postgres"
DB_USER=${POSTGRES_USER:-postgres}
DB_NAME=${POSTGRES_DB:-eatsandbeats}

# Wait for PostgreSQL to be ready using pg_isready
until pg_isready -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Database is ready!"

# Run migrations
echo "Running database migrations..."
# Check if migrations directory exists and has migrations
if [ -d "/app/prisma/migrations" ] && [ "$(ls -A /app/prisma/migrations 2>/dev/null)" ]; then
  echo "Migrations found, deploying..."
  npx prisma migrate deploy
else
  echo "No migrations found, pushing schema directly..."
  npx prisma db push --accept-data-loss --skip-generate
fi

echo "Starting application..."
exec "$@"


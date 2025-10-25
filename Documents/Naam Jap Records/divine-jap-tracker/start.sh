#!/bin/bash

echo "Starting Divine Jap Tracker application..."

# Check if NODE_ENV is set to production
if [ "$NODE_ENV" = "production" ]; then
  echo "Production environment detected. Using PostgreSQL schema."
  cp prisma/schema.production.prisma prisma/schema.prisma
  echo "Running Prisma Migrate Deploy..."
  npx prisma migrate deploy
  echo "Running production database initialization script..."
  node scripts/init-production-db.js
else
  echo "Non-production environment detected. Using default schema."
fi

echo "Running Prisma generate..."
npx prisma generate

echo "Starting Next.js application..."
exec npm run start

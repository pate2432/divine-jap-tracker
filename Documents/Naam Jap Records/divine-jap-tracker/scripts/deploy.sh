#!/bin/bash

# Railway deployment script for Divine Jap Tracker

echo "🚀 Starting Railway deployment..."

# Check if we're in production
if [ "$NODE_ENV" = "production" ]; then
    echo "📦 Production environment detected"
    
    # Use production schema
    cp prisma/schema.production.prisma prisma/schema.prisma
    echo "✅ Switched to production schema"
    
    # Generate Prisma client
    npx prisma generate
    echo "✅ Generated Prisma client"
    
    # Push database schema
    npx prisma db push --accept-data-loss
    echo "✅ Pushed database schema"
    
    # Initialize database with default users
    node scripts/init-production-db.js
    echo "✅ Initialized production database"
else
    echo "🔧 Development environment detected"
    
    # Use local schema (SQLite)
    echo "✅ Using local SQLite schema"
fi

echo "🎉 Deployment setup complete!"

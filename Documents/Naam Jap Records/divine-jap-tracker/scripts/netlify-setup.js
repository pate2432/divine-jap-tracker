#!/usr/bin/env node

/**
 * Netlify setup script
 * This script prepares the Prisma schema for production deployment
 */

const fs = require('fs')
const path = require('path')

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma')
const productionSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.production.prisma')

console.log('🔧 Setting up Prisma for Netlify production...')

// Read production schema
const productionSchema = fs.readFileSync(productionSchemaPath, 'utf8')

// Write to main schema file (will be used during build)
fs.writeFileSync(schemaPath, productionSchema)

console.log('✅ Prisma schema updated for PostgreSQL production')
console.log('📝 Using production schema for build')


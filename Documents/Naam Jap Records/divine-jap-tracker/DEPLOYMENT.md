# Railway Deployment Guide

## Prerequisites
1. Railway account
2. Railway CLI installed (`npm install -g @railway/cli`)

## Deployment Steps

### 1. Login to Railway
```bash
railway login
```

### 2. Initialize Railway Project
```bash
railway init
```

### 3. Add PostgreSQL Database
```bash
railway add postgresql
```

### 4. Set Environment Variables
```bash
# Get the DATABASE_URL from Railway dashboard
railway variables set NODE_ENV=production
railway variables set DATABASE_URL=$DATABASE_URL
```

### 5. Deploy
```bash
railway up
```

## Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string (auto-provided by Railway)
- `NODE_ENV=production`

## Database Initialization
The app will automatically:
1. Generate Prisma client
2. Push database schema
3. Create default users (ak, manna) with password "password123"

## Access
After deployment, your app will be available at:
`https://your-app-name.railway.app`

## Default Users
- Username: `ak`, Password: `password123`
- Username: `manna`, Password: `password123`

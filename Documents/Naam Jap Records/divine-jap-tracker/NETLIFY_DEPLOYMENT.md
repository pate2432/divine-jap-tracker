# Netlify Deployment Guide for Divine Jap Tracker

## Prerequisites
1. Netlify account (sign up at https://netlify.com)
2. PostgreSQL database (can use Netlify add-ons or external service like Supabase, Railway, or Neon)
3. GitHub repository connected to Netlify

## Deployment Steps

### Option 1: Deploy via Netlify Dashboard (Recommended)

#### Step 1: Prepare Your Repository
1. Make sure your code is pushed to GitHub
2. All files including `netlify.toml` should be in the repository

#### Step 2: Create New Site on Netlify
1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect to your GitHub repository
4. Select the repository: `pate2432/divine-jap-tracker`

#### Step 3: Configure Build Settings
- **Build command:** `npm run build`
- **Publish directory:** `.next` (auto-detected by Next.js plugin)
- **Node version:** 20 (set in netlify.toml)

#### Step 4: Set Environment Variables
In Netlify dashboard → Site settings → Environment variables, add:

```
DATABASE_URL=your_postgresql_connection_string
NODE_ENV=production
```

**To get a PostgreSQL database:**
- **Option A: Supabase (Free tier available)**
  1. Go to https://supabase.com
  2. Create a new project
  3. Go to Settings → Database
  4. Copy the connection string (URI format)
  5. Use format: `postgresql://postgres:[YOUR-PASSWORD]@[HOST]:5432/postgres`

- **Option B: Railway PostgreSQL**
  1. Go to Railway dashboard
  2. Create new PostgreSQL service
  3. Copy the DATABASE_URL from variables

- **Option C: Neon (Free tier available)**
  1. Go to https://neon.tech
  2. Create a new project
  3. Copy the connection string

#### Step 5: Deploy
1. Click "Deploy site"
2. Wait for build to complete (usually 2-5 minutes)
3. Your site will be live at: `https://your-site-name.netlify.app`

### Option 2: Deploy via Netlify CLI

#### Install Netlify CLI
```bash
npm install -g netlify-cli
```

#### Login to Netlify
```bash
netlify login
```

#### Initialize Site
```bash
cd divine-jap-tracker
netlify init
```

#### Set Environment Variables
```bash
netlify env:set DATABASE_URL "your_postgresql_connection_string"
netlify env:set NODE_ENV "production"
```

#### Deploy
```bash
netlify deploy --prod
```

## Post-Deployment Setup

### Initialize Database
After first deployment, you need to run database migrations:

1. **Via Netlify Functions** (if you create a migration function):
   - Visit: `https://your-site.netlify.app/api/migrate` (if created)

2. **Via Netlify CLI** (recommended):
   ```bash
   netlify functions:invoke migrate-db
   ```

3. **Via External Script**:
   - Use a database management tool
   - Run the Prisma migrations manually
   - Or create a one-time setup script

### Create Default Users
After database is initialized, create default users by running:
```bash
# Via Netlify CLI
netlify functions:invoke seed-users
```

Or manually insert via database:
```sql
-- Users will be created with password: password123
-- Username: ak
-- Username: manna
```

## Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/dbname` |
| `NODE_ENV` | Environment | `production` |

## Build Configuration

The `netlify.toml` file is already configured with:
- Build command: `npm run build`
- Next.js plugin for optimal performance
- Node.js version: 20

## Troubleshooting

### Build Fails
- Check Node version (should be 20)
- Verify all dependencies are in package.json
- Check build logs in Netlify dashboard

### Database Connection Issues
- Verify DATABASE_URL is correctly set
- Check if database allows connections from Netlify IPs
- Ensure database is accessible (not blocked by firewall)

### Runtime Errors
- Check function logs in Netlify dashboard
- Verify Prisma client is generated (`prisma generate` runs in postinstall)
- Ensure environment variables are set correctly

## Default Users After Setup

- **Username:** `ak`, **Password:** `password123`
- **Username:** `manna`, **Password:** `password123`

## Continuous Deployment

Once connected to GitHub, Netlify will automatically:
- Deploy on every push to main/master branch
- Run build with your configuration
- Update your live site

## Custom Domain

To add a custom domain:
1. Go to Site settings → Domain management
2. Add your custom domain
3. Follow DNS configuration instructions

## Support

For issues, check:
- Netlify Status: https://www.netlifystatus.com
- Netlify Docs: https://docs.netlify.com
- Next.js on Netlify: https://docs.netlify.com/integrations/frameworks/nextjs/


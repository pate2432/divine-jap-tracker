# Netlify Deployment - Quick Start Guide

## 🚀 Quick Deployment Steps

### 1. Prepare Your Database

Get a PostgreSQL database URL from one of these providers:
- **Supabase** (Recommended - Free tier): https://supabase.com
- **Neon** (Free tier): https://neon.tech
- **Railway**: https://railway.app
- **Render**: https://render.com

Your connection string should look like:
```
postgresql://user:password@host:5432/database
```

### 2. Deploy to Netlify

#### Option A: Via Netlify Dashboard (Easiest)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Netlify deployment"
   git push origin main
   ```

2. **Go to Netlify Dashboard**
   - Visit https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub and select your repository

3. **Configure Build Settings**
   - Build command: `npm run build` (auto-detected)
   - Publish directory: `.next` (auto-detected)
   - Click "Show advanced" → "New variable"
   - Add these environment variables:

   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | Your PostgreSQL connection string |
   | `NODE_ENV` | `production` |

4. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete (~3-5 minutes)

#### Option B: Via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize and deploy
cd divine-jap-tracker
netlify init
netlify env:set DATABASE_URL "your_postgresql_connection_string"
netlify env:set NODE_ENV "production"
netlify deploy --prod
```

### 3. Initialize Database

After deployment, initialize your database:

1. **Visit the init endpoint** (replace with your Netlify URL):
   ```
   https://your-site.netlify.app/api/init-db?secret=your-secret-key
   ```

   Or set `INIT_SECRET_KEY` in Netlify environment variables and use it.

2. **Or use Netlify CLI**:
   ```bash
   curl -X POST https://your-site.netlify.app/api/init-db?secret=your-secret-key
   ```

### 4. Test Your Deployment

Visit your Netlify URL and test:
- Login with:
  - Username: `ak`, Password: `password123`
  - Username: `manna`, Password: `password123`

## 📝 Default Users

After initialization:
- **ak**: `password123`
- **manna**: `password123`

**⚠️ Important**: Change these passwords after first login!

## 🔧 Troubleshooting

### Build Fails
- Check build logs in Netlify dashboard
- Verify `DATABASE_URL` is set correctly
- Ensure Node version is 20

### Database Connection Error
- Verify PostgreSQL URL format is correct
- Check database allows connections from Netlify
- Ensure database is not paused (Supabase/Neon)

### 500 Errors After Deployment
- Check function logs in Netlify dashboard
- Verify Prisma client is generated
- Run database initialization endpoint

## 🌐 Custom Domain

To add a custom domain:
1. Go to Site settings → Domain management
2. Add your domain
3. Follow DNS setup instructions

## 📚 More Information

See `NETLIFY_DEPLOYMENT.md` for detailed deployment guide.

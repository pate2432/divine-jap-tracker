# Netlify Deployment Checklist

## ✅ Pre-Deployment Checklist

- [x] Netlify configuration files created (`netlify.toml`, `.netlifyignore`)
- [x] Database initialization endpoint created (`/api/init-db`)
- [x] Build script configured for production
- [x] Production Prisma schema ready
- [x] Environment variables documented

## 📋 Deployment Steps

### Step 1: Get PostgreSQL Database
Choose one:
- [ ] **Supabase** (Recommended): https://supabase.com
  - Create project → Get connection string
  - Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`
- [ ] **Neon**: https://neon.tech
- [ ] **Railway**: https://railway.app
- [ ] **Render**: https://render.com

### Step 2: Push Code to GitHub
```bash
git add .
git commit -m "Ready for Netlify deployment"
git push origin main
```

### Step 3: Deploy on Netlify

1. [ ] Go to https://app.netlify.com
2. [ ] Click "Add new site" → "Import an existing project"
3. [ ] Connect to GitHub
4. [ ] Select repository: `pate2432/divine-jap-tracker`
5. [ ] Configure build settings:
   - Build command: `npm run build` (auto-detected)
   - Publish directory: `.next` (auto-detected)
6. [ ] Add environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NODE_ENV`: `production`
   - `INIT_SECRET_KEY`: (Optional) Secret key for database initialization
7. [ ] Click "Deploy site"
8. [ ] Wait for build to complete (~3-5 minutes)

### Step 4: Initialize Database

After deployment succeeds:

1. [ ] Visit: `https://your-site.netlify.app/api/init-db?secret=your-secret-key`
   - Or if you set `INIT_SECRET_KEY`, use that value
   - Or visit without secret if you didn't set one

2. [ ] You should see:
   ```json
   {
     "message": "Database initialized successfully",
     "createdUsers": ["ak", "manna"]
   }
   ```

### Step 5: Test Your Site

1. [ ] Visit your Netlify URL
2. [ ] Test login:
   - Username: `ak`, Password: `password123`
   - Username: `manna`, Password: `password123`
3. [ ] Verify timezone handling works correctly
4. [ ] Test count submission and editing

## 🔧 Troubleshooting

### Build Fails
- Check build logs in Netlify dashboard
- Verify all dependencies are installed
- Check Node version is 20

### Database Connection Error
- Verify `DATABASE_URL` format is correct
- Check database allows external connections
- Ensure database is not paused (Supabase/Neon)

### Runtime Errors
- Check function logs in Netlify dashboard
- Verify Prisma client is generated
- Check environment variables are set

### Database Initialization Fails
- Verify `DATABASE_URL` is correct
- Check database permissions
- Review function logs for errors

## 📝 Post-Deployment

- [ ] Change default passwords after first login
- [ ] Set up custom domain (optional)
- [ ] Configure automatic deployments from GitHub
- [ ] Set up monitoring/alerts (optional)

## 🔗 Useful Links

- Netlify Dashboard: https://app.netlify.com
- Netlify Docs: https://docs.netlify.com
- Next.js on Netlify: https://docs.netlify.com/integrations/frameworks/nextjs/


# Netlify Deployment - Step by Step Guide

## 🎯 Complete Walkthrough

Follow these steps exactly to deploy your app on Netlify.

---

## Step 1: Get Your PostgreSQL Database (5 minutes)

### Option A: Supabase (Recommended)

1. **Go to Supabase**
   - Visit: https://supabase.com
   - Click **"Start your project"** (top right)

2. **Sign Up**
   - Click **"Sign in with GitHub"** (easiest option)
   - Authorize Supabase to access your GitHub

3. **Create New Project**
   - Click **"New Project"** button
   - Fill in the form:
     - **Name**: `divine-jap-tracker` (or any name you like)
     - **Database Password**: Create a strong password (⚠️ **SAVE THIS!**)
     - **Region**: Choose closest to you (e.g., "US East" or "Asia Pacific")
   - Click **"Create new project"**
   - Wait 2-3 minutes for setup to complete

4. **Get Connection String**
   - Once project is ready, click on your project
   - Go to **Settings** (gear icon in left sidebar)
   - Click **"Database"** in the settings menu
   - Scroll down to **"Connection string"** section
   - Click on **"URI"** tab
   - You'll see something like:
     ```
     postgresql://postgres.[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
     ```
   - **IMPORTANT**: Replace `[YOUR-PASSWORD]` with the password you created in step 3
   - **Copy the entire connection string** (Ctrl+C or Cmd+C)
   - Save it somewhere safe - you'll need it in Step 4

✅ **You now have your DATABASE_URL!**

---

## Step 2: Verify Code is on GitHub (1 minute)

1. **Check GitHub Repository**
   - Go to: https://github.com/pate2432/divine-jap-tracker
   - Verify you can see your code
   - Make sure the latest commit is there (should show "Add Netlify deployment configuration...")

✅ **If you see your code, you're ready!**

---

## Step 3: Create Netlify Account (2 minutes)

1. **Go to Netlify**
   - Visit: https://app.netlify.com
   - Click **"Sign up"** (top right)

2. **Sign Up with GitHub**
   - Click **"Sign up with GitHub"**
   - Authorize Netlify to access your GitHub account
   - Complete the signup process

✅ **You're now logged into Netlify!**

---

## Step 4: Deploy Your Site (10 minutes)

### 4.1: Import Your Repository

1. **Start New Site**
   - In Netlify dashboard, click **"Add new site"** (top right)
   - Click **"Import an existing project"**

2. **Connect to GitHub**
   - Click **"GitHub"** button
   - If prompted, authorize Netlify to access your repositories
   - You might need to click **"Configure Netlify on GitHub"** and authorize

3. **Select Your Repository**
   - Search for: `divine-jap-tracker`
   - Click on it
   - Click **"Next"**

### 4.2: Configure Build Settings

You'll see a form with build settings. Here's what to fill:

**Build command** (should auto-fill):
```
npm run build
```

**Publish directory** (should auto-fill):
```
.next
```

**Branch to deploy**:
```
main
```

⚠️ **Don't click "Deploy site" yet!** We need to add environment variables first.

### 4.3: Add Environment Variables

1. **Click "Show advanced"** (at the bottom of the form)

2. **Click "New variable"** button

3. **Add First Variable:**
   - **Key**: `DATABASE_URL`
   - **Value**: Paste your PostgreSQL connection string from Step 1
   - Click **"Add variable"**

4. **Add Second Variable:**
   - Click **"New variable"** again
   - **Key**: `NODE_ENV`
   - **Value**: `production`
   - Click **"Add variable"**

5. **Verify Variables:**
   - You should see both variables listed:
     - `DATABASE_URL` = `postgresql://...`
     - `NODE_ENV` = `production`

### 4.4: Deploy

1. **Click "Deploy site"** button (bottom right)

2. **Wait for Build**
   - You'll see a build progress screen
   - Build typically takes 3-5 minutes
   - Don't close the browser tab!

3. **Watch for Success**
   - When build completes, you'll see:
     - ✅ "Site is live"
     - A URL like: `https://random-name-12345.netlify.app`

⚠️ **Note**: The first build might fail because the database isn't initialized yet. That's okay - we'll fix it in the next step!

---

## Step 5: Initialize Database (2 minutes)

### 5.1: Check Your Site URL

- After deployment, note your site URL
- It will be something like: `https://your-site-name.netlify.app`

### 5.2: Initialize Database

1. **Open a new browser tab**

2. **Visit the init endpoint:**
   ```
   https://your-site-name.netlify.app/api/init-db
   ```
   (Replace `your-site-name` with your actual Netlify site name)

3. **You should see:**
   ```json
   {
     "message": "Database initialized successfully",
     "createdUsers": ["ak", "manna"]
   }
   ```

✅ **If you see this, your database is ready!**

### 5.3: If You Get an Error

If you see an error, check:
- Did you set `DATABASE_URL` correctly?
- Is your database paused? (Go to Supabase dashboard and check)
- Check Netlify function logs for more details

---

## Step 6: Test Your Site (2 minutes)

1. **Visit Your Site**
   - Go to your Netlify URL: `https://your-site-name.netlify.app`

2. **Test Login**
   - Try logging in with:
     - **Username**: `ak`
     - **Password**: `password123`
   - Or:
     - **Username**: `manna`
     - **Password**: `password123`

3. **Test Features**
   - Add a count
   - Check if dashboard loads
   - Verify timezone is working

✅ **If everything works, you're done!**

---

## Step 7: Customize Your Site (Optional)

### 7.1: Change Site Name

1. Go to **Site settings** → **General**
2. Click **"Change site name"**
3. Enter a custom name (e.g., `divine-jap-tracker`)
4. Your new URL will be: `https://divine-jap-tracker.netlify.app`

### 7.2: Add Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow the DNS setup instructions

---

## 🎉 You're Done!

Your app is now live on Netlify!

**Your site URL**: `https://your-site-name.netlify.app`

---

## 🔧 Troubleshooting

### Build Fails

**Problem**: Build fails with errors

**Solutions**:
1. Check build logs in Netlify dashboard
2. Verify `DATABASE_URL` is set correctly
3. Make sure Node version is 20 (set in netlify.toml)

### Database Connection Error

**Problem**: Can't connect to database

**Solutions**:
1. Verify `DATABASE_URL` format is correct
2. Check Supabase dashboard - is database paused?
3. Make sure you replaced `[YOUR-PASSWORD]` in connection string

### Site Shows 500 Error

**Problem**: Site loads but shows error

**Solutions**:
1. Check function logs in Netlify dashboard
2. Make sure database is initialized (visit `/api/init-db`)
3. Verify environment variables are set

### Can't Login

**Problem**: Login doesn't work

**Solutions**:
1. Make sure database is initialized
2. Check if users exist in database
3. Verify password is `password123`

---

## 📝 Quick Reference

| Step | What | Where |
|------|------|-------|
| 1 | Get Database | https://supabase.com |
| 2 | Verify GitHub | https://github.com/pate2432/divine-jap-tracker |
| 3 | Netlify Account | https://app.netlify.com |
| 4 | Deploy Site | Netlify Dashboard → Add new site |
| 5 | Init Database | `https://your-site.netlify.app/api/init-db` |
| 6 | Test | Visit your Netlify URL |

---

## 🆘 Need Help?

- **Netlify Status**: https://www.netlifystatus.com
- **Netlify Docs**: https://docs.netlify.com
- **Supabase Docs**: https://supabase.com/docs
- **Check Build Logs**: Netlify Dashboard → Deploys → Click on deploy → View logs

---

## ✅ Deployment Checklist

- [ ] Created Supabase account and project
- [ ] Got PostgreSQL connection string
- [ ] Verified code is on GitHub
- [ ] Created Netlify account
- [ ] Imported repository to Netlify
- [ ] Added `DATABASE_URL` environment variable
- [ ] Added `NODE_ENV=production` environment variable
- [ ] Clicked "Deploy site"
- [ ] Waited for build to complete
- [ ] Initialized database via `/api/init-db`
- [ ] Tested login on live site
- [ ] Everything works! 🎉

---

**Good luck with your deployment!** 🚀


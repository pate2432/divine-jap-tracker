# What to Write in Netlify Base Directory

## ✅ Answer: Leave it EMPTY (Blank)

Based on the repository structure, your files (`package.json`, `netlify.toml`) are at the **repository root** on GitHub.

## In Netlify Dashboard:

1. Go to **Site settings** → **Build & deploy** → **Continuous Deployment**
2. Click **"Edit settings"**
3. Find **"Base directory"** field
4. **Leave it EMPTY** (don't type anything, just leave it blank)
5. Set:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
6. Click **"Save"**

## Why Empty?

- Your `package.json` is at the root of the GitHub repository
- Netlify will look for files starting from the repo root
- No base directory is needed

## If That Doesn't Work:

If leaving it empty still fails, check GitHub directly:

1. Visit: https://github.com/pate2432/divine-jap-tracker
2. Look at the file structure
3. If you see `package.json` in the root (first page), base directory should be **EMPTY**
4. If `package.json` is inside a folder (like `divine-jap-tracker/package.json`), use that folder name as base directory

## Most Common Answer:

**Base directory**: (Leave EMPTY - blank field)

This works for 99% of cases where files are at repo root.


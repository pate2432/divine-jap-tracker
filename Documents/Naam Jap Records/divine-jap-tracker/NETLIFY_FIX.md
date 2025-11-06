# Fix for Netlify Build Error: package.json not found

## Problem
Netlify can't find `package.json` because the project files are in a subdirectory on GitHub.

## Solution: Configure Base Directory in Netlify

### Option 1: Via Netlify Dashboard (Recommended)

1. **Go to Netlify Dashboard**
   - Visit: https://app.netlify.com
   - Click on your site

2. **Open Build Settings**
   - Go to **Site settings** → **Build & deploy** → **Continuous Deployment**
   - Click **"Edit settings"** under "Build settings"

3. **Set Base Directory**
   - Find **"Base directory"** field
   - Enter: `divine-jap-tracker`
   - (If your files are in `Documents/Naam Jap Records/divine-jap-tracker/`, you might need to check the exact path on GitHub)

4. **Verify Build Settings**
   - **Base directory**: `divine-jap-tracker`
   - **Build command**: `npm run build`
   - **Publish directory**: `divine-jap-tracker/.next`

5. **Save and Redeploy**
   - Click **"Save"**
   - Go to **Deploys** tab
   - Click **"Trigger deploy"** → **"Deploy site"**

### Option 2: Check GitHub Repository Structure First

1. **Check GitHub**
   - Go to: https://github.com/pate2432/divine-jap-tracker
   - Look at the file structure
   - Is `package.json` in the root, or in a subdirectory?

2. **If files are in root:**
   - The issue might be something else
   - Check if `package.json` is actually committed
   - Verify the file exists in the latest commit

3. **If files are in subdirectory:**
   - Use that subdirectory name as the "Base directory" in Netlify
   - For example, if structure is:
     ```
     divine-jap-tracker/
       package.json
       src/
       ...
     ```
   - Then set Base directory to: `divine-jap-tracker`

## Quick Fix Steps

1. ✅ Check GitHub repository structure
2. ✅ Set Base directory in Netlify dashboard
3. ✅ Update Publish directory to: `{base-directory}/.next`
4. ✅ Save settings
5. ✅ Trigger new deploy

## Alternative: Move Repository Root

If the repository root is at a higher level than expected, you might need to:

1. Create a new repository just for the project
2. Or restructure the current repository
3. Or use the base directory setting as shown above

## After Fix

Once you've set the base directory correctly:
- Netlify will find `package.json`
- Build should succeed
- Your site will deploy successfully


# Netlify Function Error Troubleshooting

## Common Causes of "Unknown Error" in Netlify Functions

### 1. Missing Environment Variables
**Symptom**: Function fails with generic error

**Solution**: 
- Check Netlify Dashboard → Site settings → Environment variables
- Ensure `DATABASE_URL` is set correctly
- Verify `NODE_ENV=production` is set

### 2. Database Connection Issues
**Symptom**: Function times out or fails silently

**Solution**:
- Verify PostgreSQL database is accessible from Netlify
- Check if database allows connections from external IPs
- Ensure connection string format is correct: `postgresql://user:password@host:5432/database`
- Test connection using a database client

### 3. Prisma Client Not Generated
**Symptom**: `Cannot find module '@prisma/client'` or similar

**Solution**:
- Ensure `prisma generate` runs during build (it's in `postinstall` script)
- Check build logs to verify Prisma client generation
- If needed, add explicit `npx prisma generate` in build command

### 4. Function Timeout
**Symptom**: Function exceeds execution time limit

**Solution**:
- Netlify functions have a 10-second timeout on free tier
- Optimize database queries
- Use connection pooling
- Consider using Next.js API routes instead of Netlify functions

### 5. Missing Dependencies
**Symptom**: Module not found errors

**Solution**:
- Ensure all dependencies are in `dependencies` (not `devDependencies`)
- Check `package.json` includes all required packages
- Verify `node_modules` is not in `.netlifyignore`

## How to Debug Function Errors

### 1. Check Function Logs
1. Go to Netlify Dashboard
2. Navigate to Functions tab
3. Click on the function that's failing
4. Check the logs for detailed error messages

### 2. Test Function Locally
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Test function locally
netlify functions:invoke init-db --no-identity
```

### 3. Check Build Logs
1. Go to Netlify Dashboard → Deploys
2. Click on the latest deploy
3. Check build logs for any errors during function bundling

### 4. Verify Environment Variables
```bash
# List environment variables
netlify env:list

# Get specific variable
netlify env:get DATABASE_URL
```

## Improved Error Handling

The updated `init-db.js` function now includes:
- ✅ Database connection validation
- ✅ Better error messages with stack traces
- ✅ Proper timeout handling
- ✅ Content-Type headers
- ✅ Individual user creation error handling
- ✅ Detailed logging

## Next Steps

1. **Check Netlify Function Logs**: 
   - Go to Netlify Dashboard → Functions → init-db → Logs
   - Look for the detailed error messages we added

2. **Verify Environment Variables**:
   - Ensure `DATABASE_URL` is set in Netlify dashboard
   - Check if `INIT_SECRET_KEY` is set (if using secret protection)

3. **Test Database Connection**:
   - Try connecting to your PostgreSQL database from another tool
   - Verify the connection string is correct

4. **Check Prisma Schema**:
   - Ensure `prisma/schema.prisma` uses `provider = "postgresql"`
   - Verify migrations are applied (if using migrations)

## Alternative: Use Next.js API Routes

If Netlify functions continue to have issues, you can use the Next.js API route instead:
- Route: `/api/init-db` (already exists)
- Access via: `https://your-site.netlify.app/api/init-db`
- This runs as a Next.js serverless function (more reliable)

## Common Error Messages and Solutions

| Error | Solution |
|-------|----------|
| "DATABASE_URL environment variable is not set" | Set `DATABASE_URL` in Netlify environment variables |
| "Connection timeout" | Check database accessibility, verify connection string |
| "Module not found: @prisma/client" | Ensure `prisma generate` runs in build |
| "Unauthorized" | Check `INIT_SECRET_KEY` matches the secret in request |
| "Failed to create any users" | Check database permissions, verify schema is applied |


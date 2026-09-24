# Vercel Postgres Setup Guide

## Step 1: Add Vercel Postgres to Your Project

1. Go to your Vercel project dashboard:
   https://vercel.com/birukzeradawit/archive

2. Navigate to the **Storage** tab in your project

3. Click **"Create Database"** and select **"Postgres"**

4. Choose your region (recommended: Washington, D.C. for your current deployment)

5. Click **"Create"**

## Step 2: Configure Environment Variables

After creating the database, Vercel will automatically add these environment variables:

- `POSTGRES_URL` - Full connection string
- `POSTGRES_PRISMA_URL` - Prisma connection string  
- `POSTGRES_NON_POOLING_URL` - Non-pooling connection string
- `POSTGRES_USER` - Database username
- `POSTGRES_HOST` - Database host
- `POSTGRES_PASSWORD` - Database password
- `POSTGRES_DATABASE` - Database name

## Step 3: Update Backend Configuration

Update your `.env` file to use Vercel's environment variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration (Vercel Postgres)
DB_HOST=${POSTGRES_HOST}
DB_PORT=5432
DB_NAME=${POSTGRES_DATABASE}
DB_USER=${POSTGRES_USER}
DB_PASSWORD=${POSTGRES_PASSWORD}

# JWT Secret
JWT_SECRET=your_jwt_secret_key_change_this_in_production

# Frontend URL (for CORS)
FRONTEND_URL=https://archive-olive.vercel.app
```

## Step 4: Run Database Schema

Once connected, run the schema to create tables:

```bash
# Using the Vercel Postgres connection string
psql $POSTGRES_URL -f backend/config/schema.sql
```

Or use the Vercel Postgres web interface to run the SQL commands from `backend/config/schema.sql`.

## Step 5: Test the Connection

Test that your backend can connect to the database:

```bash
# Test locally with Vercel Postgres
vercel env pull .env
node backend/server.js
```

## Step 6: Deploy Backend

Update your Vercel configuration to include the backend:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

## Alternative: Use Vercel Postgres Web Interface

If you prefer not to use command line tools:

1. Go to Vercel Postgres dashboard
2. Click on your database
3. Use the "Query" tab to run SQL commands
4. Copy and paste the contents of `backend/config/schema.sql`
5. Execute the SQL to create all tables

## Benefits of Vercel Postgres

- **Automatic Backups**: Daily backups with point-in-time recovery
- **Connection Pooling**: Built-in connection pooling for performance
- **Security**: Automatic SSL encryption
- **Scaling**: Handles growth automatically
- **Monitoring**: Built-in metrics and monitoring
- **No Maintenance**: Vercel handles all database maintenance

## Cost

- **Hobby**: Free (up to 512MB storage, 60 hours compute)
- **Pro**: $20/month (8GB storage, 500 hours compute)
- **Enterprise**: Custom pricing

For your archive website, the Hobby tier should be sufficient initially.

## Next Steps After Setup

1. ✅ Create Vercel Postgres database
2. ✅ Run database schema
3. ✅ Update environment variables
4. ✅ Test API endpoints
5. ✅ Remove localStorage fallback from frontend
6. ✅ Deploy to production
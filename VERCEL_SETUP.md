# Vercel Backend Setup Instructions

The backend has been deployed to Vercel, but requires additional configuration to work properly. Follow these steps to complete the setup:

## 1. Set Environment Variables in Vercel Dashboard

Go to your Vercel project dashboard and add the following environment variables:

1. Navigate to: https://vercel.com/birukzeradawit/archive/settings/environment-variables
2. Add these environment variables:

### Required Environment Variables:

- `NODE_ENV` = `production`
- `JWT_SECRET` = (Generate a secure random string)
- `DB_HOST` = (Your PostgreSQL host)
- `DB_PORT` = `5432`
- `DB_NAME` = (Your database name)
- `DB_USER` = (Your database user)
- `DB_PASSWORD` = (Your database password)
- `FRONTEND_URL` = `https://archive-olive.vercel.app`

## 2. Set Up PostgreSQL Database

You have several options for PostgreSQL hosting:

### Option A: Vercel Postgres (Recommended)
1. Go to Vercel dashboard → Storage
2. Add "Postgres" database
3. Copy the connection details to your environment variables

### Option B: External PostgreSQL (Supabase, Railway, etc.)
1. Create a PostgreSQL database on your preferred service
2. Add the connection details to Vercel environment variables

### Option C: Local Development
For local development, you can use a local PostgreSQL instance and update the `.env` file.

## 3. Run Database Schema

Once your database is set up, run the schema file to create the tables:

```bash
# If using local PostgreSQL
psql -d your_database_name -f backend/config/schema.sql

# If using cloud PostgreSQL, you may need to use their web interface or CLI
```

## 4. Test the Backend

After configuration, test the API endpoints:

```bash
# Test categories endpoint
curl https://archive-olive.vercel.app/api/categories

# Test content endpoint
curl https://archive-olive.vercel.app/api/content
```

## 5. Alternative: Use Serverless Functions

If you prefer not to use a full backend server, you can convert the backend to Vercel serverless functions:

1. Move route files to `api/` directory
2. Rename files to match Vercel API structure
3. Update imports and exports

## Current Deployment Status

- ✅ Backend code deployed to Vercel
- ✅ Database schema created
- ✅ API endpoints configured
- ⚠️ Environment variables need to be set in Vercel dashboard
- ⚠️ PostgreSQL database needs to be configured

## Next Steps

1. Set up PostgreSQL database (Vercel Postgres recommended)
2. Add environment variables in Vercel dashboard
3. Run database schema on your database
4. Test API endpoints
5. Update frontend to use the API endpoints

## API Endpoints Available

Once configured, these endpoints will be available:

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/categories` - Get categories
- `GET /api/content` - Get content
- `POST /api/content` - Create content (requires auth)
- `GET /api/archive` - Get archive items
- `POST /api/uploads/single` - Upload file (requires auth)

## Support

For issues with Vercel deployment, check:
- Vercel dashboard logs
- Environment variable configuration
- Database connection status
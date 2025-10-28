# Football Predictions App - Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Create `.env.local` file in the root directory with:

```env
# Neon Database Connection
DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require

# SportMonks API Token
SPORTMONKS_API_TOKEN=your_api_token_here

# JWT Secret (generate a random 32+ character string)
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Setup Database

```bash
# Generate migrations
npx drizzle-kit generate

# Push schema to database
npx drizzle-kit push
```

### 4. Run Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

## First Time Setup Checklist

- [ ] Node.js 18+ installed
- [ ] Neon DB account created
- [ ] Database created in Neon
- [ ] SportMonks API account created
- [ ] API token obtained from SportMonks
- [ ] `.env.local` file created with all variables
- [ ] Dependencies installed (`npm install`)
- [ ] Database migrations run (`npx drizzle-kit push`)
- [ ] Development server started (`npm run dev`)

## Testing the App

1. **Register a new account**
   - Navigate to http://localhost:3000/register
   - Create an account with email and password
   - You'll start with 100 coins

2. **Login**
   - Use your credentials to login
   - You'll be redirected to the dashboard

3. **Dashboard Features**
   - View your coin balance
   - Add coins manually (temporary feature)
   - View latest football fixtures

## Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to set in Vercel/production:
- `DATABASE_URL` - Production Neon DB URL
- `SPORTMONKS_API_TOKEN` - Your API token
- `JWT_SECRET` - Strong random secret (32+ chars)
- `NEXT_PUBLIC_APP_URL` - Your production domain

## Common Issues

### Database Connection Error
- Check DATABASE_URL is correct
- Verify IP whitelist in Neon dashboard
- Ensure SSL mode is included in connection string

### Fixtures Not Loading
- Verify SPORTMONKS_API_TOKEN is set
- Check API quota/limits
- Test API endpoint directly

### Authentication Issues
- Clear browser cookies
- Verify JWT_SECRET is set
- Check middleware configuration

## API Endpoints

- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login  
- `POST /api/auth/logout` - Logout
- `GET /api/user/me` - Get user info
- `POST /api/user/coins` - Add coins
- `GET /api/fixtures` - Get fixtures

## Tech Stack Summary

✅ Next.js 14+ (App Router)
✅ TypeScript
✅ Shadcn UI + Tailwind CSS
✅ Drizzle ORM
✅ Neon DB (PostgreSQL)
✅ JWT Authentication
✅ Zod Validation
✅ SportMonks API

## Support

For issues, check:
1. README.md for detailed documentation
2. Console logs in browser dev tools
3. Terminal logs for server errors

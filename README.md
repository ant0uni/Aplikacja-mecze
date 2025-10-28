# Football Predictions App 🏆⚽

A production-ready full-stack football prediction application built with Next.js, TypeScript, and modern web technologies. Users can view fixtures, make predictions, and earn coins based on their accuracy.

## 🚀 Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Shadcn UI, Tailwind CSS, Lucide Icons
- **Backend**: Next.js API Routes, Drizzle ORM
- **Database**: Neon DB (PostgreSQL)
- **Authentication**: JWT with httpOnly cookies, bcryptjs
- **Validation**: Zod
- **External API**: SportMonks Football API

## ✨ Features

- ✅ Secure user authentication (registration, login, logout)
- ✅ JWT-based session management with httpOnly cookies
- ✅ Protected routes with middleware
- ✅ View latest football fixtures from SportMonks API
- ✅ Coin-based prediction system
- ✅ Manual coin management (temporary feature for testing)
- ✅ Production-ready security headers
- ✅ Input validation and sanitization
- ✅ Black and white minimalist UI theme

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Neon DB account and database (PostgreSQL)
- A SportMonks API token

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd football
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env.local`:
   ```bash
   copy .env.example .env.local  # Windows
   # or
   cp .env.example .env.local    # Mac/Linux
   ```

   Update `.env.local` with your actual credentials:
   ```env
   # Database - Your Neon DB connection string
   DATABASE_URL=postgresql://username:password@host/database?sslmode=require

   # SportMonks API - Your API token
   SPORTMONKS_API_TOKEN=your_actual_api_token_here

   # JWT Secret - Generate a secure random string (min 32 characters)
   JWT_SECRET=your_very_long_random_secret_key_here_at_least_32_characters

   # App URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Generate and run database migrations**
   ```bash
   # Generate migration files
   npx drizzle-kit generate

   # Push schema to database
   npx drizzle-kit push
   ```

   Alternatively, you can run migrations manually:
   ```bash
   npx drizzle-kit migrate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the app**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

### Users Table
- `id`: Serial primary key
- `email`: Unique email address
- `password`: Hashed password (bcrypt)
- `coins`: Integer (default: 100)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Fixtures Table
- `id`: Serial primary key
- `api_id`: SportMonks fixture ID (unique)
- `sport_id`, `league_id`, `season_id`: Reference IDs
- `name`: Match name (e.g., "Team A vs Team B")
- `starting_at`: Match start time
- `result_info`: Match result
- `state_id`: Match state
- `has_odds`: Boolean

### Predictions Table
- `id`: Serial primary key
- `user_id`: Foreign key to users
- `fixture_id`: Foreign key to fixtures
- `predicted_outcome`: Enum (home_win, away_win, draw)
- `coins_wagered`: Integer
- `coins_won`: Integer
- `is_settled`: Boolean

## 🔒 Security Features

- **Password Hashing**: bcryptjs with 12 salt rounds
- **JWT Authentication**: Secure tokens with 7-day expiration
- **HttpOnly Cookies**: Prevents XSS attacks
- **CORS Headers**: Proper cross-origin resource sharing
- **Security Headers**: XSS protection, frame options, content type options
- **Input Validation**: Zod schemas on all API routes
- **SQL Injection Protection**: Drizzle ORM parameterized queries
- **Protected Routes**: Middleware-based authentication checks

## 📁 Project Structure

```
football/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── register/route.ts
│   │   │   └── logout/route.ts
│   │   ├── fixtures/route.ts
│   │   └── user/
│   │       ├── me/route.ts
│   │       └── coins/route.ts
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── page.tsx (Dashboard)
│   ├── layout.tsx
│   └── globals.css
├── components/
│   └── ui/ (Shadcn components)
├── db/
│   ├── index.ts
│   ├── schema.ts
│   └── migrations/
├── lib/
│   ├── auth.ts
│   ├── validations.ts
│   └── utils.ts
├── middleware.ts
├── drizzle.config.ts
├── next.config.ts
└── package.json
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### User
- `GET /api/user/me` - Get current user info
- `POST /api/user/coins` - Add coins (temporary feature)

### Fixtures
- `GET /api/fixtures` - Fetch latest fixtures from SportMonks

## 🎨 UI Components

All UI components are from Shadcn UI library:
- Button
- Card
- Form
- Input
- Label

Icons are from Lucide React.

## 🚀 Deployment

### Environment Variables (Production)

Make sure to set these in your production environment:

1. `DATABASE_URL` - Your production Neon DB connection string
2. `SPORTMONKS_API_TOKEN` - Your SportMonks API token
3. `JWT_SECRET` - A strong random secret (min 32 characters)
4. `NEXT_PUBLIC_APP_URL` - Your production URL

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Pre-deployment Checklist

- [ ] Update environment variables in production
- [ ] Run database migrations on production database
- [ ] Test authentication flow
- [ ] Verify API token is working
- [ ] Check security headers
- [ ] Test on different devices

## 📝 Development Notes

### Temporary Features
- Manual coin addition: Currently users can add coins manually. This will be replaced with ads/rewards system.

### Future Enhancements
- Implement prediction functionality
- Add coin rewards for correct predictions
- Integrate ad system for earning coins
- Add user statistics and leaderboard
- Implement real-time match updates
- Add notifications for match results

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Verify your DATABASE_URL is correct
# Ensure your IP is whitelisted in Neon DB settings
```

### API Token Issues
```bash
# Verify SPORTMONKS_API_TOKEN is set correctly
# Check API quota limits
```

### Migration Issues
```bash
# Reset migrations if needed
rm -rf db/migrations
npx drizzle-kit generate
npx drizzle-kit push
```

## 📄 License

This project is private and proprietary.

## 🤝 Support

For issues or questions, please contact the development team.

---

Built with ❤️ using Next.js and modern web technologies.

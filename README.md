# Tibia Guild Manager

A comprehensive SaaS platform for Tibia guild management with real-time player tracking, death notifications, and enemy monitoring.

## Features

- **Real-time Player Tracking**: Monitor guild members and enemies across all worlds
- **Death Notifications**: Instant alerts for PvP and PvE deaths with detailed analysis
- **Enemy Monitoring**: Track enemy guilds and get alerts when they come online
- **Advanced Analytics**: Detailed statistics and guild performance insights
- **Multi-Guild Support**: Manage main guilds and academy guilds from one dashboard
- **Multi-World Coverage**: Monitor players across multiple Tibia worlds
- **Mobile App**: React Native app for iOS and Android (coming soon)

## Technology Stack

- **Backend**: Node.js with Next.js 14+ (App Router)
- **Frontend**: React 18+ with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **Authentication**: NextAuth.js with character-based login
- **Real-time**: WebSocket with Socket.io (planned)
- **API Integration**: TibiaData API v4
- **State Management**: Zustand (planned)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd guildmanager
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/guildmanager"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# TibiaData API
TIBIADATA_API_URL="https://api.tibiadata.com/v4"
TIBIADATA_RATE_LIMIT=60
```

4. Set up the database:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

5. Seed the database (optional):
```bash
npx prisma db seed
```

6. Start the development server:
```bash
npm run dev
```

7. Initialize background services:
```bash
curl -X POST http://localhost:3000/api/system/init
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard components
│   ├── landing/        # Landing page components
│   ├── providers/      # Context providers
│   └── ui/             # shadcn/ui components
├── lib/                # Utility functions
├── services/           # Business logic and external APIs
├── types/              # TypeScript type definitions
└── hooks/              # Custom React hooks (planned)
```

## API Endpoints

### Authentication
- `POST /api/auth/signin` - Character-based login
- `POST /api/auth/signout` - Logout

### Dashboard
- `GET /api/dashboard/stats` - Guild statistics
- `GET /api/dashboard/online-players` - Online players
- `GET /api/dashboard/recent-deaths` - Recent deaths

### System
- `POST /api/system/init` - Initialize background jobs
- `GET /api/system/init` - System status

## Authentication System

The platform uses a unique character-based authentication system:

1. **Character Verification**: Character existence is verified with Tibia servers
2. **Guild Password**: Each guild has a password for member access
3. **World Verification**: Character must be in the specified world
4. **Guild Membership**: Character must be in a registered guild

### User Roles

- **Guild Member**: Basic access to guild monitoring
- **Guild Admin**: Manage guild settings and members
- **Super Admin**: System administration access

## Database Schema

The application uses PostgreSQL with Prisma ORM. Key entities:

- **User**: System users linked to Tibia characters
- **Guild**: Tibia guilds with passwords and settings
- **Player**: Tibia characters being tracked
- **Death**: Death records with PvP/PvE classification
- **AlertRule**: Custom notification rules
- **Subscription**: Payment and billing information

## TibiaData API Integration

The platform integrates with TibiaData API v4:

- **Rate Limiting**: Respects API rate limits (60 requests/minute)
- **Caching**: Intelligent caching to minimize API calls
- **Batch Processing**: Efficient bulk character processing
- **Error Handling**: Robust error handling and retries

## Background Services

### Death Tracker
- Monitors guild member deaths every 30 seconds
- Classifies deaths as PvP or PvE based on killers
- Stores death history for analysis

### Online Status Monitor
- Updates player online status every minute
- Tracks online history for analytics
- Monitors enemy player activity

### Data Cleanup
- Removes old cache entries hourly
- Cleans up old notifications and logs
- Maintains database performance

## Development

### Running Tests
```bash
npm test
```

### Database Operations
```bash
# Reset database
npx prisma migrate reset

# Generate Prisma client
npx prisma generate

# View database
npx prisma studio
```

### Linting and Formatting
```bash
npm run lint
npm run lint:fix
```

## Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Database Setup

1. Create a PostgreSQL database (recommended: Supabase, Railway, or Neon)
2. Run migrations: `npx prisma migrate deploy`
3. Initialize background jobs via API call

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@tibiaguildmanager.com or join our Discord server.

## Roadmap

- [ ] WebSocket real-time notifications
- [ ] Mobile app (React Native + Expo)
- [ ] Advanced analytics dashboard
- [ ] Subscription management with Stripe
- [ ] Multi-language support
- [ ] API for third-party integrations
- [ ] Advanced alert system
- [ ] Guild war tracking
- [ ] Player statistics and rankings

---

Built with ❤️ for the Tibia community.
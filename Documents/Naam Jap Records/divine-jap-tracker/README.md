# Divine Jap Tracker

A spiritual practice tracking application for tracking daily Nam Jap counts together.

## Features

- 🔐 User authentication with secure password hashing
- 📿 Daily count tracking with Digital Mala component
- 📊 Statistics and progress visualization
- 🏆 Competitive side-by-side comparison for the last 7 days
- 📈 Weekly progress charts
- 📱 Responsive design with beautiful UI
- 💾 Data persistence with Prisma ORM
- 📄 PDF export functionality

## Tech Stack

- **Framework**: Next.js 16.0.0 (React 19.2.0)
- **Language**: TypeScript
- **Database**: SQLite (local) / PostgreSQL (production)
- **ORM**: Prisma 6.18.0
- **Styling**: Tailwind CSS 4
- **UI Libraries**: Framer Motion, Recharts, Lucide React
- **Authentication**: bcryptjs

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/pate2432/divine-jap-tracker.git
cd divine-jap-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env.local file
DATABASE_URL="file:./dev.db"
```

4. Initialize the database:
```bash
npx prisma generate
npx prisma db push
node seed.js
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Default Users

- **Username**: `ak` | **Password**: `password123`
- **Username**: `manna` | **Password**: `password123`

## Deployment

### Netlify

See [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md) for detailed deployment instructions.

### Railway

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Railway deployment instructions.

## Project Structure

```
divine-jap-tracker/
├── src/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── dashboard/    # Dashboard page
│   │   └── page.tsx      # Login page
│   ├── components/       # React components
│   └── lib/              # Utility functions
├── prisma/               # Database schema
├── public/               # Static assets
└── scripts/              # Deployment scripts
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

Private project

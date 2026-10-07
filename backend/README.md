# FURKO Backend API

Backend API service for the **FURKO** CivicTech & Direct Service Routing platform, serving citizens, municipality dispatchers, and pilot utility institutions in Jimma City, Ethiopia.

---

## 🌟 Tech Stack

- **Runtime:** Node.js (>= 18.x)
- **Framework:** Express.js (v4)
- **Language:** TypeScript
- **Database:** PostgreSQL 16 with PostGIS extension
- **Security & Logging:** Helmet, CORS, Morgan, dotenv
- **Development Engine:** `tsx` watch mode for rapid iteration

---

## 📁 Project Architecture

```
backend/
├── .env.example            # Sample environment variables
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── dist/                   # Compiled JavaScript build (production)
├── src/
│   ├── app.ts              # Express application configuration & middleware
│   ├── server.ts           # Server bootstrap and graceful shutdown
│   ├── config/             # Config files (environment variables, database pool)
│   │   ├── env.ts          # Typed environment settings
│   │   ├── db.ts           # PostgreSQL Pool with PostGIS integration
│   │   └── db.js           # CommonJS fallback connection
│   ├── controllers/        # Request handlers
│   │   └── health.controller.ts
│   ├── middleware/         # Express middlewares
│   │   ├── errorHandler.ts # Centralized error formatting
│   │   └── notFoundHandler.ts # 404 Route handler
│   ├── models/             # Domain TypeScript interfaces & schemas
│   │   └── index.ts
│   ├── routes/             # API routing modules
│   │   ├── index.ts        # v1 aggregator route
│   │   └── health.routes.ts# Health check endpoint
│   ├── services/           # Business logic & external service integrations
│   │   ├── health.service.ts
│   │   └── routing/        # Direct Service Routing rule engine
│   └── utils/              # Helper utilities
└── tests/                  # Integration & unit tests
```

---

## 🚀 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (v9 or higher)
- [Docker](https://www.docker.com/) (for PostgreSQL / PostGIS container)

### 2. Database Setup

Start the local PostGIS database using Docker Compose from the project root:

```bash
docker compose up -d furko-db
```

This starts PostgreSQL with PostGIS on port `5432` with database `furko_db`.

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Review and update variables in `.env` as needed:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Port for the HTTP API server |
| `NODE_ENV` | `development` | Runtime environment (`development`, `production`, `test`) |
| `API_PREFIX` | `/api/v1` | URL prefix for versioned endpoints |
| `CORS_ORIGIN` | `*` | Allowed CORS origins (comma-separated or `*`) |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `furko_db` | PostgreSQL database name |
| `DB_USER` | `furko_user` | PostgreSQL username |
| `DB_PASSWORD` | `furko_password` | PostgreSQL password |
| `JWT_SECRET` | `...` | Secret key for JWT signing |

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Server

**Development mode (auto-reload):**
```bash
npm run dev
```

**Type-checking:**
```bash
npm run typecheck
```

**Production build & start:**
```bash
npm run build
npm start
```

---

## 📡 API Endpoints

### Health Check

- `GET /health` or `GET /api/v1/health`
  - Returns server health status, uptime, memory metrics, and PostgreSQL connectivity probe.

**Sample Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-10-07T12:00:00.000Z",
    "uptimeSeconds": 42,
    "environment": "development",
    "version": "1.0.0",
    "services": {
      "api": {
        "status": "up",
        "memoryUsage": {
          "rssMb": 48.2,
          "heapUsedMb": 23.5
        }
      },
      "database": {
        "status": "connected",
        "responseTimeMs": 4
      }
    }
  }
}
```

---

## 📜 License

MIT License - FURKO CivicTech Initiative.

# 🚗 AutoTraq

**Inventory & Operations Management for Auto Parts**

AutoTraq is a full-stack web application for managing auto parts inventory, vehicle fitments, interchange groups, and fulfillment workflows. Built for small shops and parts operations that need reliable, auditable inventory tracking.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)

---

## ✨ Features

- **Parts Management** — Create, edit, and search parts with structured SKU generation and barcode support
- **Vehicle Fitments** — Link parts to compatible vehicles (year 2000+) for accurate cross-referencing
- **Interchange Groups** — Group equivalent/interchangeable parts together
- **Inventory Tracking** — Append-only ledger for full audit trail (receive, correct, return)
- **Request Workflow** — Create → Approve → Fulfill pipeline for parts requests
- **Role-Based Access** — Admin, Manager, Fulfillment, and Viewer roles with granular permissions
- **Barcode Login** — Quick barcode scan login for warehouse staff
- **Part Images** — Upload and manage photos for each part
- **CSV Import/Export** — Bulk data management
- **Notifications** — In-app alerts for low stock, request status changes, and role decisions
- **Advanced Search** — Filter by system/component hierarchy, condition, and availability
- **Analytics Dashboard** — Inventory history, top movers, and dead stock reports

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS 4, TypeScript |
| **Backend** | Express.js, TypeScript, Zod validation |
| **Database** | MySQL 8.0 with Prisma ORM |
| **Auth** | JWT with role-based access control |
| **Security** | Helmet, CORS, rate limiting, bcrypt |
| **Testing** | Vitest, Supertest |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **Docker** and Docker Compose (for MySQL)
- **npm**

### 1. Clone & Install

```bash
git clone https://github.com/an5onc/autotraq.git
cd autotraq
```

### 2. Start the Database

```bash
docker compose up -d
```

This starts MySQL on port 3306 with database `autotraq` / user `autotraq` / password `autotraq123`.

### 3. Backend Setup

```bash
cd backend
npm install
cp .env.example .env    # Uses default local settings
npx prisma generate
npx prisma migrate dev  # Run database migrations
npm run db:seed-admins  # Seed admin accounts (optional)
npm run dev             # Start dev server at http://localhost:3001
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev             # Start dev server at http://localhost:5173
```

### Default Admin Login

After running `db:seed-admins`:
- **Email:** `anson@autotraq.com`
- **Password:** `autotraq2026`

---

## 📁 Project Structure

```
autotraq/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── repositories/   # Database access (Prisma)
│   │   ├── routes/         # API route definitions
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── schemas/        # Zod validation schemas
│   │   ├── scripts/        # Seed scripts
│   │   └── utils/          # Helpers
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── tests/              # Unit & integration tests
├── frontend/
│   └── src/
│       ├── api/            # API client
│       ├── contexts/       # React contexts (auth, theme)
│       ├── pages/          # Page components
│       └── components/     # Shared UI components
├── docs/                   # API documentation
├── docker-compose.yml      # Local MySQL setup
└── DEPLOY.md               # Railway deployment guide
```

---

## 🧪 Running Tests

```bash
cd backend
npm test              # All tests
npm run test:unit     # Unit tests only
npm run test:int      # Integration tests only
npm run test:watch    # Watch mode
```

---

## 🌐 Deployment

AutoTraq is configured for **Railway** deployment. See **[DEPLOY.md](DEPLOY.md)** for full step-by-step instructions.

**Quick overview:**
1. Provision MySQL on Railway
2. Deploy backend (Express API) as a service
3. Deploy frontend (React SPA) as a service
4. Set environment variables to connect them

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `DATABASE_URL` | MySQL connection string | `mysql://autotraq:autotraq123@localhost:3306/autotraq` |
| `JWT_SECRET` | Secret for signing JWTs | *(change in production)* |
| `JWT_EXPIRES_IN` | Token expiry | `24h` |
| `FRONTEND_URL` | Allowed CORS origin (production) | — |
| `NODE_ENV` | Environment | `development` |

### Frontend

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | *(falls back to same-origin `/api`)* |

---

## 👥 Roles & Permissions

| Action | Admin | Manager | Fulfillment | Viewer |
|--------|:-----:|:-------:|:-----------:|:------:|
| View all data | ✅ | ✅ | ✅ | ✅ |
| Create parts/vehicles | ✅ | ✅ | | |
| Manage fitments/groups | ✅ | ✅ | | |
| Receive stock | ✅ | ✅ | ✅ | |
| Stock corrections | ✅ | ✅ | | |
| Approve requests | ✅ | ✅ | | |
| Fulfill requests | ✅ | ✅ | ✅ | |
| Create requests | ✅ | ✅ | ✅ | ✅ |
| Manage users | ✅ | | | |

---

## 📄 API Documentation

See [docs/api.md](docs/api.md) for the full API reference.

---

## 📝 License

MIT

---

*Built by Anson's team — Spring 2026*

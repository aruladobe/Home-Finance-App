# FinanceHome

A full-stack personal finance management application for tracking income, expenses, investments, and planned expenditures across family members.

## Features

- **Dashboard** — overview of financial health with charts and summaries
- **Income Tracking** — log and categorize income sources
- **Expense Management** — track and analyze spending
- **Investment Tracking** — monitor investment portfolio
- **Planned Expenses** — budget for future expenditures
- **User Management** — multi-user support with family member profiles
- **PDF Export** — generate financial reports via jsPDF
- **JWT Authentication** — secure login and session management

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (jsonwebtoken), bcryptjs |
| HTTP Client | Axios |

## Project Structure

```
finance-app/
├── server/
│   ├── index.js              # Express app entry point
│   ├── routes/
│   │   ├── auth.js
│   │   ├── expenses.js
│   │   ├── income.js
│   │   ├── investments.js
│   │   ├── plannedExpenses.js
│   │   └── familyMembers.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Expense.js
│   │   ├── Income.js
│   │   ├── Investment.js
│   │   ├── PlannedExpense.js
│   │   └── FamilyMember.js
│   └── middleware/
├── client/
│   ├── src/
│   │   ├── pages/            # Route-level page components
│   │   ├── components/       # Shared UI components
│   │   ├── context/          # React context providers
│   │   ├── hooks/            # Custom React hooks
│   │   └── utils/
│   └── vite.config.js
├── package.json              # Root — backend deps & scripts
└── start.sh                  # One-command local startup
```

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB (local) **or** a MongoDB Atlas connection string

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/aruladobe/Home-Finance-App.git
cd finance-app
```

### 2. Install dependencies

```bash
npm run install-all
```

This installs both backend and frontend dependencies.

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/finance-app
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

> For MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string (see [MongoDB Atlas setup](#mongodb-atlas-setup) below).

### 4. Start the application

**Option A — single script (recommended):**

```bash
./start.sh
```

**Option B — manual:**

```bash
# Terminal 1 — backend
npm run dev

# Terminal 2 — frontend
npm run client
```

The app will be available at:
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:5000](http://localhost:5000)
- Health check: [http://localhost:5000/api/health](http://localhost:5000/api/health)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET/POST | `/api/income` | List / create income records |
| GET/PUT/DELETE | `/api/income/:id` | Read / update / delete income |
| GET/POST | `/api/expenses` | List / create expenses |
| GET/PUT/DELETE | `/api/expenses/:id` | Read / update / delete expense |
| GET/POST | `/api/investments` | List / create investments |
| GET/PUT/DELETE | `/api/investments/:id` | Read / update / delete investment |
| GET/POST | `/api/planned-expenses` | List / create planned expenses |
| GET/POST | `/api/family-members` | List / create family members |
| GET | `/api/health` | Server health check |

## MongoDB Atlas Setup

1. Create a free account at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free **M0** cluster
3. Under **Security → Database Access**, add a database user with read/write access
4. Under **Security → Network Access**, whitelist your IP (or `0.0.0.0/0` for open access)
5. Click **Connect → Drivers** on your cluster and copy the connection string
6. Replace `MONGODB_URI` in your `.env`:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/finance-app?retryWrites=true&w=majority
```

## Deployment

### Backend — Render

1. Push your repo to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Connect your GitHub repo
4. Set build command: `npm install`
5. Set start command: `node server/index.js`
6. Add environment variables: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV=production`

### Frontend — Vercel

1. Create a new project on [vercel.com](https://vercel.com)
2. Set root directory to `client`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variable: `VITE_API_URL=https://your-render-backend.onrender.com`

### Database — MongoDB Atlas

Follow the [MongoDB Atlas Setup](#mongodb-atlas-setup) section above and use the Atlas `MONGODB_URI` in your Render environment variables.

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: `5000`) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key for signing JWTs |
| `NODE_ENV` | No | `development` or `production` |
| `CLIENT_URL` | No | Frontend origin for CORS (default: `http://localhost:5173`) |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start backend with nodemon (hot reload) |
| `npm run start` | Start backend (production) |
| `npm run client` | Start frontend dev server |
| `npm run dev:all` | Start backend and frontend concurrently |
| `npm run install-all` | Install all dependencies (root + client) |
| `./start.sh` | One-command startup (also starts MongoDB if needed) |

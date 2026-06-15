# SplitwiseXD - Shared Expenses Monorepo

A precision-engineered, ledger-centric shared expense tracking application. SplitwiseXD allows flatmates (Aisha, Rohan, Priya, Meera, Sam, Dev) to track shared expenses, calculate exact balances, and settle up debts.

## 🚀 Quick Start (Development)

This project is configured as a Turborepo monorepo using **Bun**.

### 1. Prerequisites
Ensure you have [Bun](https://bun.sh/) installed:
```bash
powershell -c "irm bun.sh/install.ps1 | iex"
```

### 2. Installation
Install workspace dependencies from the root directory:
```bash
bun install
```

### 3. Environment Setup
The environment variables are already configured in the root `.env`. The database connects to a pooled PostgreSQL instance on Prisma.

### 4. Running the App
Start both the Express backend and the Next.js frontend concurrently using:
```bash
bun run dev
```
- **Next.js Frontend**: [http://localhost:3000](http://localhost:3000)
- **Express Backend**: [http://localhost:3001](http://localhost:3001)

### 5. Production Build
To verify type checks and compile the production bundle:
```bash
bun run build
```

---

## 📂 Project Structure

```
├── apps/
│   ├── web/         # Next.js 16 Frontend (React 19, Tailwind v4, Lucide Icons)
│   └── backend/     # Express API Server (Node HTTP, Socket.io, JWT Authentication)
├── packages/
│   ├── db/          # Database package containing Prisma schema and Client
│   ├── utils/       # Shared business logic and utilities
│   └── tsconfig/    # Shared TypeScript configurations
└── README.md
```

---

## 🛠️ Main Features Implemented

1. **Authentication with Demo Mode**: Users can sign up and login. For ease of testing, the Sign In screen offers **demo user logins** for the flatmates (Aisha, Rohan, Priya, Meera, Sam, Dev).
2. **Dynamic Group Management**: Create groups, invite members, and remove members (allowed only if their net balance is exactly zero).
3. **Flexible Expense Splits**: Add expenses splitting equally, unequally (exact amounts), by percentages (must sum to 100%), or by weighted shares.
4. **Detailed Audit Trails**: Clicking a user's balance filters the expense logs to show exactly which expenses and splits make up that balance (Rohan's audit requirement).
5. **Interactive CSV Importer**: Upload `expenses_export.csv` to run it through an anomaly engine detecting duplicates, USD trip expenses, pre-join/post-leave mismatches, and settlement rows. Allows interactive approval before committing.
6. **Real-time Collaboration**: WebSocket-based comments section inside expenses for instant group coordination.

---

## 🤖 AI Collaboration Details
- **AI Tool Used**: Gemini 3.5 Flash (Medium) as the primary coding and engineering collaborator.
- Refer to [AI_USAGE.md](file:///D:/project/splitwisexd/AI_USAGE.md) for prompts and the debugging log.
- Refer to [SCOPE.md](file:///D:/project/splitwisexd/SCOPE.md) for database schema and CSV anomaly logs.
- Refer to [DECISIONS.md](file:///D:/project/splitwisexd/DECISIONS.md) for architectural decision logs.

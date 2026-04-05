# Finance Dashboard API

A RESTful backend API for a finance dashboard system with role-based access control, financial records management, and aggregated analytics — built with **Node.js**, **Express**, and **MongoDB**.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Role-Based Access Control](#role-based-access-control)
- [Running Tests](#running-tests)
- [Design Decisions & Assumptions](#design-decisions--assumptions)
- [Tradeoffs](#tradeoffs)

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Runtime | Node.js + Express | Lightweight, well-understood, great ecosystem |
| Database | MongoDB + Mongoose | Schema flexibility for financial records, strong aggregation pipeline |
| Auth | JWT (jsonwebtoken) | Stateless, suitable for API consumers |
| Validation | express-validator | Declarative, chainable, composable |
| Security | helmet, cors, express-mongo-sanitize, express-rate-limit | Defence in depth |
| Docs | swagger-jsdoc + swagger-ui-express | Auto-generated from JSDoc annotations |
| Logging | winston | Structured, configurable log levels |
| Testing | Jest + supertest | Fast, zero-dependency test runner with full mocking support |

---

## Project Structure

```
src/
├── config/
│   ├── database.js        # MongoDB connection
│   └── swagger.js         # OpenAPI spec config
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── recordController.js
│   └── dashboardController.js
├── middleware/
│   ├── auth.js            # JWT authentication + role authorization
│   ├── validators.js      # express-validator rules for every route
│   └── errorHandler.js    # Global error handler + 404 handler
├── models/
│   ├── User.js            # User schema with roles + bcrypt
│   └── FinancialRecord.js # Financial record schema with soft delete
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── records.js
│   └── dashboard.js
├── services/
│   ├── authService.js     # Register, login, profile, change password
│   ├── userService.js     # User CRUD + pagination
│   ├── recordService.js   # Record CRUD + filtering
│   └── dashboardService.js# Aggregation pipelines for analytics
├── tests/
│   ├── helpers/testSetup.js
│   ├── auth.test.js
│   ├── users.test.js
│   ├── records.test.js
│   └── dashboard.test.js
├── utils/
│   ├── logger.js          # Winston logger
│   └── response.js        # Standardised JSON response helpers
├── app.js                 # Express app setup
└── server.js              # Entry point + graceful shutdown
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local instance or MongoDB Atlas)

### Installation

```bash
git clone <repo-url>
cd finance-dashboard
npm install
```

### Configuration

```bash
cp .env.example .env
# Edit .env and set your MONGO_URI and JWT_SECRET
```

### Start the server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The server starts on `http://localhost:3000` by default.

- **API Docs (Swagger UI):** `http://localhost:3000/api/docs`
- **Health Check:** `http://localhost:3000/health`
- **Raw OpenAPI JSON:** `http://localhost:3000/api/docs.json`

### Seed an admin user

There is no seed script included (by design — see assumptions below). Register your first user via the API, then manually update their role in MongoDB if you need an admin:

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@example.com","password":"admin123"}'

# Manually promote to admin in MongoDB shell
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | Environment (`development`, `production`, `test`) |
| `PORT` | `3000` | HTTP port |
| `MONGO_URI` | — | MongoDB connection string |
| `JWT_SECRET` | — | Secret key for signing JWTs |
| `JWT_EXPIRES_IN` | `7d` | Token expiry duration |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window in ms (15 min) |
| `RATE_LIMIT_MAX` | `100` | Max requests per window per IP |

---

## API Overview

All endpoints are prefixed with `/api`. Authentication is via `Authorization: Bearer <token>`.

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | No | Register a new user |
| POST | `/login` | No | Login, receive JWT |
| GET | `/profile` | Yes | Get current user profile |
| PATCH | `/change-password` | Yes | Change own password |

### Users — `/api/users`

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/` | Admin | List all users (paginated, filterable) |
| GET | `/:id` | Admin | Get user by ID |
| PATCH | `/:id` | Admin | Update name, role, or status |
| DELETE | `/:id` | Admin | Permanently delete a user |

### Financial Records — `/api/records`

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/` | All | List records (paginated, filterable, sortable) |
| GET | `/:id` | All | Get single record |
| POST | `/` | Analyst, Admin | Create a record |
| PATCH | `/:id` | Analyst, Admin | Update a record |
| DELETE | `/:id` | Admin | Soft-delete a record |

**Supported filters for `GET /api/records`:**

| Param | Type | Description |
|---|---|---|
| `type` | `income` \| `expense` | Filter by transaction type |
| `category` | string | Partial match on category name |
| `startDate` / `endDate` | ISO 8601 date | Date range filter |
| `minAmount` / `maxAmount` | number | Amount range filter |
| `search` | string | Full-text search in description, category, tags |
| `sortBy` | `date` \| `amount` \| `category` \| `createdAt` | Sort field (default: `date`) |
| `sortOrder` | `asc` \| `desc` | Sort direction (default: `desc`) |
| `page` / `limit` | integer | Pagination (default: `1` / `20`) |

### Dashboard — `/api/dashboard`

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/` | All | Full dashboard payload (all sections combined) |
| GET | `/summary` | All | Total income, expenses, net balance |
| GET | `/categories` | All | Category-wise income/expense breakdown |
| GET | `/trends/monthly` | All | Monthly income vs expense trends |
| GET | `/trends/weekly` | All | Weekly income vs expense trends |
| GET | `/recent` | All | Recent activity feed |
| GET | `/top-categories` | All | Top spending categories (expenses) |

All dashboard endpoints accept an optional `?period=week|month|quarter|year` query parameter.

---

## Role-Based Access Control

Three roles are supported. Access is enforced via the `authorize(...roles)` middleware on every route.

| Action | Viewer | Analyst | Admin |
|---|:---:|:---:|:---:|
| View records | ✅ | ✅ | ✅ |
| View dashboard | ✅ | ✅ | ✅ |
| Create records | ❌ | ✅ | ✅ |
| Update records | ❌ | ✅ | ✅ |
| Delete records (soft) | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

---

## Running Tests

The test suite uses **Jest + Supertest** with full model mocking — no real MongoDB connection required for tests.

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage
```

**64 tests across 4 suites:**

| Suite | Tests | What it covers |
|---|---|---|
| `auth.test.js` | 16 | Register, login, profile, token validation |
| `users.test.js` | 18 | User CRUD, role enforcement, edge cases |
| `records.test.js` | 19 | Record CRUD, filtering, access control |
| `dashboard.test.js` | 11 | All analytics endpoints, empty states |

> **Note on `mongodb-memory-server`:** The tests mock Mongoose at the module level (`jest.mock`), so no MongoDB binary is downloaded. If you prefer integration tests against a real in-memory database, install `mongodb-memory-server` and replace the mock helpers with `MongoMemoryServer.create()` — the application code is identical.

---

## Design Decisions & Assumptions

**Soft delete on records:** Financial data should be auditable. Deleting a record sets `isDeleted: true` and a `deletedAt` timestamp rather than removing the document. Mongoose's query middleware automatically excludes soft-deleted records from all standard `find` queries.

**Role model:** Three roles (viewer / analyst / admin) are intentionally minimal and cover the typical finance dashboard use case. The `authorize()` middleware is variadic — adding a new role anywhere requires only a one-line change.

**Category is a free-form string:** The assignment does not fix a category list. Categories are stored in lowercase and can be anything. A reference list of common categories is exported from the model for frontend autocomplete suggestions.

**No self-destruction:** Admins cannot delete or deactivate their own account via the API. This is a safety guard enforced in the service layer.

**Password security:** Passwords are hashed with bcrypt (cost factor 12) and the `password` field has `select: false` on the Mongoose schema, so it is never returned in any query response by default.

**JWT is stateless:** There is no token blacklist. If a token needs to be invalidated before expiry (e.g. on password change), the calling client should discard the token. A production system would add a token version field to the user document.

**Rate limiting:** Applied to all `/api/*` routes via `express-rate-limit`. The window and max values are configurable via environment variables.

**Input sanitisation:** `express-mongo-sanitize` strips `$` and `.` from request bodies and query strings to prevent MongoDB operator injection. `helmet` sets security-relevant HTTP headers.

**Logging:** Winston logs to console. In production, add a file transport or pipe to a log aggregation service.

---

## Tradeoffs

| Decision | Tradeoff |
|---|---|
| JWT stateless auth | Simple to scale horizontally; cannot revoke tokens without extra infrastructure |
| Soft delete | Preserves audit history; requires `isDeleted: false` filter on every query (handled by Mongoose pre-hook) |
| Free-form categories | Flexible; no referential integrity — a typo creates a new category |
| Mock-based tests | Fast and portable; less confidence than integration tests against a real DB |
| Single `.env` file | Easy to set up locally; secret management should be externalised in production |

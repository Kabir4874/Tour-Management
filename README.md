# Tour Management Backend

A modular Node.js/Express backend for a tour management platform.  
The API is organized by feature modules (auth, users, tours, divisions, bookings, payments) and uses MongoDB via Mongoose.

## Tech Stack

- Node.js
- Express 5
- TypeScript
- MongoDB + Mongoose
- Zod (request validation)
- Passport (local + Google OAuth)
- JWT + cookie/session auth
- Cloudinary + Multer (media pipeline dependencies included)

## Project Structure (Backend)

```text
backend/
  src/
    app/
      config/            # env, passport, cloudinary, multer
      errorHelpers/      # custom/app errors
      helpers/           # shared helper functions
      interfaces/        # shared TS interfaces
      middlewares/       # auth, validation, error handling, not found
      modules/
        auth/            # login, token refresh, logout, reset password, google auth
        user/            # register, list users, update user
        division/        # division CRUD
        tour/            # tour + tour type CRUD
        booking/         # booking creation
        payment/         # payment lifecycle handlers
        sslCommerz/      # SSLCommerz integration service/interfaces
      routes/            # API module route registration
      utils/             # utility scripts (e.g., super admin seed)
    app.ts               # express app configuration
    server.ts            # server bootstrap + DB connection
```

## Getting Started

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

Create a `.env` file in `backend/` with the values required by `backend/src/app/config/env.ts`.

Security notes:
- Do not commit `.env` files.
- Do not hardcode credentials/tokens in source code.
- Rotate any secret if it has been exposed.

### 3. Run in development

```bash
npm run dev
```

The backend runs on the configured port and mounts API routes under:

```text
/api/v1
```

## Available Scripts

- `npm run dev` - Run with `tsx watch`
- `npm run lint` - Run ESLint on `src`

## API Modules

Base prefix: `/api/v1`

### Auth (`/auth`)

- `POST /login`
- `POST /refresh-token`
- `POST /logout`
- `POST /reset-password` (authenticated)
- `GET /google`
- `GET /google/callback`

### User (`/user`)

- `POST /register`
- `GET /` (admin/super admin)
- `PATCH /:id` (authenticated)

### Division (`/division`)

- `POST /create` (admin/super admin)
- `GET /`
- `GET /:slug`
- `PATCH /:id` (admin/super admin)
- `DELETE /:id` (admin/super admin)

### Tour (`/tour`)

- `GET /tour-types`
- `POST /create-tour-type` (admin/super admin)
- `PATCH /tour-type/:id` (admin/super admin)
- `DELETE /tour-type/:id` (admin/super admin)
- `GET /`
- `POST /create` (admin/super admin)
- `PATCH /:id` (admin/super admin)
- `DELETE /:id` (admin/super admin)

### Booking (`/booking`)

- `POST /` (authenticated)

### Payment (`/payment`)

- `POST /init-payment/:bookingId`
- `POST /success`
- `POST /fail`
- `POST /cancel`

## Architecture Notes

- Centralized environment validation in `backend/src/app/config/env.ts`
- Request validation via Zod schemas per module
- Role-based authorization through middleware
- Centralized global error handling and `404` middleware
- Graceful shutdown handling for `SIGINT`, `SIGTERM`, uncaught exceptions, and unhandled rejections

## Health Check

```http
GET /
```

Response:

```json
{
  "message": "Server is Working"
}
```

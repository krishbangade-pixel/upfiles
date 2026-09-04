# CloudDrive Express TypeScript Backend

Production-ready REST API backend for CloudDrive, powered by Node.js, Express, TypeScript, and Supabase (PostgreSQL, Auth, Storage).

## Features

- **Supabase Auth**: Access token verification & user profile management.
- **Folder Management**: Parent-child folder hierarchy, cycle prevention, name collision prevention.
- **File Upload & Storage**: Upload initialization (`POST /api/files/init`), direct Supabase Storage upload, upload completion, signed download URLs.
- **Access Control**: Server-side role checks (Owner, Editor, Viewer) with inheritance.
- **Sharing & Links**: Direct user sharing and public share links with optional password protection and expiration.
- **Search & Filters**: Search across file & folder names with category filters.
- **Starred & Trash**: Soft delete, trash listing, restoration, and permanent purge.
- **Activity Log**: Append-only activity logs.
- **Storage Usage**: Server-side aggregated storage calculation.
- **Security**: Helmet headers, CORS restrictions, rate-limiting, Zod validation, error handling.

## Directory Structure

```
backend/
├── schema.sql
├── src/
│   ├── config/
│   │   ├── env.ts
│   │   └── supabase.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   ├── rateLimiter.ts
│   │   └── validate.ts
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── folders/
│   │   ├── files/
│   │   ├── shares/
│   │   ├── links/
│   │   ├── search/
│   │   ├── stars/
│   │   ├── trash/
│   │   ├── activities/
│   │   └── storage/
│   ├── routes/
│   │   └── index.ts
│   ├── utils/
│   │   ├── errors.ts
│   │   ├── permissions.ts
│   │   ├── storage.ts
│   │   └── filenames.ts
│   ├── app.ts
│   └── server.ts
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Setup Instructions

### 1. Database Setup (Supabase)
Copy the contents of `schema.sql` and run it in your **Supabase SQL Editor** to create all tables (`profiles`, `folders`, `files`, `shares`, `link_shares`, `stars`, `activities`), indexes, and triggers.

### 2. Environment Variables
Create `.env` in the `backend/` root directory:
```env
PORT=8080
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
SUPABASE_STORAGE_BUCKET=clouddrive
```

### 3. Installation & Running Dev Server

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start development server
npm run dev
```

The Express API will be running at `http://localhost:8080/api`.

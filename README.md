# 🎓 Student Organization Management System (SOMS)

A full-stack web application for managing student organizations, memberships, events, and documents.

---

## 🔗 Live Links

| Service | URL |
|---------|-----|
| **Frontend** | https://soms-client.vercel.app |
| **Backend API** | https://soms-api.onrender.com |
| **API Docs (Swagger)** | https://soms-api.onrender.com/api-docs |

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Angular 17 (Standalone Components) + Tailwind CSS |
| **Backend** | Node.js + Express.js + TypeScript |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | JWT (JSON Web Tokens) + bcrypt |
| **File Storage** | Supabase Storage |
| **API Docs** | Swagger / OpenAPI 3.0 |
| **Frontend Deploy** | Vercel |
| **Backend Deploy** | Render |

---

## 📁 Project Structure

```
soms/
├── client/                        # Angular 17 Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   └── layout/
│   │   │   │       └── shell/     # Main app shell with sidebar nav
│   │   │   ├── guards/            # Auth, Admin, Guest route guards
│   │   │   ├── interceptors/      # Auth token + error interceptors
│   │   │   ├── models/            # TypeScript interfaces
│   │   │   ├── pages/
│   │   │   │   ├── auth/          # Login & Register
│   │   │   │   ├── dashboard/     # User dashboard
│   │   │   │   ├── organizations/ # List + Detail views
│   │   │   │   ├── events/        # List + Detail views
│   │   │   │   ├── documents/     # File upload + management
│   │   │   │   ├── profile/       # User profile
│   │   │   │   └── admin/         # Admin panel, manage orgs/members
│   │   │   ├── services/          # HTTP service layer
│   │   │   ├── app.config.ts
│   │   │   └── app.routes.ts
│   │   ├── environments/
│   │   ├── styles.css
│   │   ├── index.html
│   │   └── main.ts
│   ├── angular.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vercel.json
│
├── server/                        # Node.js + Express Backend
│   └── src/
│       ├── config/
│       │   ├── supabase.ts        # Supabase client
│       │   ├── swagger.ts         # API documentation
│       │   └── logger.ts          # Winston logger
│       ├── controllers/           # Route handlers
│       ├── middleware/
│       │   ├── auth.ts            # JWT authentication
│       │   ├── errorHandler.ts    # Global error handling
│       │   ├── validate.ts        # Input validation
│       │   └── upload.ts          # Multer file upload
│       ├── routes/                # Express routers
│       ├── services/              # Business logic layer
│       ├── types/                 # TypeScript types
│       └── index.ts               # App entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── render.yaml
│
├── supabase-schema.sql            # Database schema + seed data
├── .env.example                   # Environment variable template
├── .gitignore
└── README.md
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn
- A [Supabase](https://supabase.com) account

---

### 1. Database Setup (Supabase)

1. Create a new project on [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase-schema.sql`
3. Go to **Storage** → **New Bucket**:
   - Name: `soms-files`
   - Toggle **Public** ON
4. Copy your **Project URL**, **anon key**, and **service_role key** from Settings → API

---

### 2. Backend Setup

```bash
cd server
cp .env.example .env
# Edit .env with your Supabase credentials and JWT secret
npm install
npm run dev       # Development with hot reload
# or
npm run build && npm start  # Production build
```

Server runs on `http://localhost:3000`
Swagger docs at `http://localhost:3000/api-docs`

---

### 3. Frontend Setup

```bash
cd client
npm install
ng serve          # Development server at http://localhost:4200
# or
npm run build:prod  # Production build → dist/soms-client/
```

> To point the frontend to your local backend, edit `src/environments/environment.ts`:
> ```ts
> export const environment = {
>   production: false,
>   apiUrl: 'http://localhost:3000/api',
> };
> ```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login, returns JWT | Public |
| GET | `/api/auth/profile` | Get current user | 🔒 |
| PUT | `/api/auth/profile` | Update profile | 🔒 |

### Organizations
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/organizations` | List all (paginated, search) | 🔒 |
| GET | `/api/organizations/:id` | Get by ID | 🔒 |
| POST | `/api/organizations` | Create new | 🔒 Admin |
| PUT | `/api/organizations/:id` | Update | 🔒 Admin |
| DELETE | `/api/organizations/:id` | Soft delete | 🔒 Admin |
| GET | `/api/organizations/:id/members` | List members | 🔒 |
| GET | `/api/organizations/:id/stats` | Stats summary | 🔒 |

### Memberships
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/memberships/join` | Request to join org | 🔒 |
| DELETE | `/api/memberships/leave/:orgId` | Leave org | 🔒 |
| GET | `/api/memberships/my` | My memberships | 🔒 |
| PATCH | `/api/memberships/:id/status` | Approve/reject | 🔒 Admin |
| PATCH | `/api/memberships/:id/role` | Update role | 🔒 Admin |

### Events
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/events` | List (paginated, upcoming filter) | 🔒 |
| GET | `/api/events/:id` | Get by ID | 🔒 |
| POST | `/api/events` | Create event | 🔒 Admin |
| PUT | `/api/events/:id` | Update event | 🔒 Admin |
| DELETE | `/api/events/:id` | Delete event | 🔒 Admin |

### Documents
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/documents` | Upload file | 🔒 |
| GET | `/api/documents` | List documents | 🔒 |
| DELETE | `/api/documents/:id` | Delete document | 🔒 |

---

## ✅ Features Implemented

### Authentication & Security
- [x] User registration with hashed passwords (bcrypt)
- [x] JWT-based login with 7-day token expiry
- [x] Role-based authorization (Admin / User)
- [x] Auth route guards (Angular)
- [x] HTTP interceptors (token injection + 401 handling)
- [x] Rate limiting (general + auth endpoints)
- [x] Helmet security headers
- [x] Input validation & sanitization (express-validator)

### Organizations
- [x] Browse all active organizations
- [x] Search by name, filter by category
- [x] Paginated results
- [x] View organization details, stats, members, events
- [x] Create / Edit / Deactivate (Admin)

### Memberships
- [x] Students request to join organizations
- [x] Admin approves or rejects requests
- [x] Members can leave organizations
- [x] Role assignment (Member / Officer / President)
- [x] My Organizations page in profile

### Events
- [x] Browse upcoming and past events
- [x] Filter by organization
- [x] Search events
- [x] Admin creates / edits / publishes / deletes events
- [x] Event detail page with date, time, location

### Documents
- [x] Upload files (PDF, Word, Excel, Images)
- [x] Drag-and-drop file upload UI
- [x] Files stored in Supabase Storage
- [x] Categorize by type (Requirement, Minutes, Report, Other)
- [x] Download files, delete own files

### Admin Panel
- [x] Overview stats dashboard
- [x] Pending membership approvals with quick approve/reject
- [x] Manage organizations table (create, edit, deactivate)
- [x] Manage members table with role management
- [x] Filter members by organization and status

### Frontend (Angular)
- [x] Standalone component architecture (Angular 17)
- [x] Lazy-loaded routes for all pages
- [x] Reactive Forms with validation
- [x] HTTP Client + RxJS Observables
- [x] Angular Signals for state management
- [x] Responsive Tailwind CSS UI
- [x] Skeleton loading states
- [x] Toast notifications
- [x] Auth/Admin/Guest route guards
- [x] Mobile-responsive sidebar

### Backend (Node.js + Express)
- [x] RESTful API with clean controller/service architecture
- [x] TypeScript throughout
- [x] Winston structured logging
- [x] Morgan HTTP request logging
- [x] Global error handling middleware
- [x] Multer + Supabase Storage file upload
- [x] Swagger/OpenAPI documentation
- [x] Compression middleware
- [x] CORS configured for production

---

## 🚢 Deployment

### Frontend → Vercel

1. Push repo to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Set **Root Directory** to `client`
4. Add environment variable:
   - `VITE_API_URL` → your Render backend URL (if using Vite)
5. Deploy — Vercel auto-detects Angular

### Backend → Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo
3. Set **Root Directory** to `server`
4. Build command: `npm install && npm run build`
5. Start command: `npm start`
6. Add environment variables from `.env.example`
7. Deploy

---

## 📸 Screenshots

> Add screenshots to the `screenshots/` folder and reference them here.

```
screenshots/
├── login.png
├── register.png
├── dashboard.png
├── organizations.png
├── org-detail.png
├── events.png
├── documents.png
├── admin-panel.png
├── admin-members.png
└── api-swagger.png
```

---

## 👥 Group Members

| Name | Role |
|------|------|
| [Member 1] | Frontend Developer |
| [Member 2] | Backend Developer |
| [Member 3] | UI/UX Designer / Repository Manager |

---

## 📘 Courses

- **ITAS4** — Client-Side Web Programming
- **ITAS5** — Server-Side Web Programming

---

## 📄 License

MIT License — for academic use only.

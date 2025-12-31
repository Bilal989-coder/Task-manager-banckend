# Internal Task Manager — Backend (Node/Express + MongoDB)

## Overview
This is the **backend API** for the Internal Task Manager system.
- **Manager (Admin)**: create/assign/update/delete tasks, view all tasks with filters + pagination
- **Member**: view only assigned tasks, update task status

---

## Tech Stack
- Node.js + Express
- MongoDB (Atlas) + Mongoose
- JWT Authentication
- CORS (Local + Vercel)

---

## Project Structure (Typical)
```txt
backend/
├─ api/
│  └─ index.js            
├─ src/
│  ├─ app.js              
│  ├─ server.js           
│  ├─ config/
│  │  └─ db.js            # MongoDB connection
│  ├─ routes/
│  ├─ controllers/
│  ├─ models/
│  ├─ middleware/
│  └─ utils/
├─ vercel.json            # Vercel config 
├─ package.json
└─ .gitignore
```

---

## Requirements
- Node.js **v18+** (recommended)
- MongoDB Atlas (recommended) or local MongoDB
- npm

---

## Setup (Local)

### 1) Install
```bash
cd backend
npm install
```

### 2) Create `.env` in `backend/`
> **Do not commit** `.env` to GitHub.

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_uri_here
JWT_SECRET=your_long_secret_here
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 3) Run dev server

npm run dev


Server should run on:
- http://localhost:5000

Health endpoint:
- http://localhost:5000/api/health

---

## API (Main)

### Auth
- `POST /api/auth/login` → login user (returns token/user)
- `GET /api/auth/me` → current user (protected)

### Users (Manager)
- `GET /api/users` → list users

### Tasks
**Manager**
- `GET /api/tasks` → list tasks (filters + pagination)
- `POST /api/tasks` → create task
- `PUT /api/tasks/:id` → update task
- `DELETE /api/tasks/:id` → delete task

**Member**
- `GET /api/tasks/my` → list assigned tasks only
- `PATCH /api/tasks/:id/status` → update status of own task

---

## CORS Notes (Important)
When frontend is on Vercel, you must allow that domain in backend CORS.

Example (Vercel + local):
```env
CORS_ORIGINS=https://YOUR_FRONTEND.vercel.app,http://localhost:5173
```

If you change frontend URL, update this env in Vercel and redeploy.

---

## Deployment (Vercel)

### Option A (Recommended): Vercel Serverless Function
1. Push `backend/` to GitHub (as a separate repo or monorepo)
2. In Vercel → **New Project** → import the repo
3. Add Environment Variables in Vercel:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `CORS_ORIGINS`
4. Deploy

After deploy, verify:
- `https://YOUR_BACKEND.vercel.app/api/health`

### Option B: Separate Hosting (Render/Railway)
You can also deploy on Render/Railway if you prefer a long-running server.
In that case, set env variables there the same way.

---

## Common Troubleshooting

### 1) 500 on login
Check backend logs on Vercel:
- usually Mongo URI missing/incorrect
- JWT_SECRET missing
- code crashing due to wrong imports/paths

### 2) CORS error
If browser says: **No 'Access-Control-Allow-Origin'**
- add frontend domain to `CORS_ORIGINS` env
- redeploy backend

### 3) MongoDB connection issue
- ensure IP whitelist in MongoDB Atlas is correct (0.0.0.0/0 for testing)
- ensure username/password and DB name are valid

---


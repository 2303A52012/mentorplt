# 🎓 MentorPLT — Mentor-Mentee Platform

A full-stack MERN application connecting mentors and mentees.

---

## 📁 Project Structure

```
mentor-platform/
├── backend/      → Node.js + Express + MongoDB API
└── frontend/     → React.js SPA
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 2. Backend Setup
```bash
cd backend
npm install
# Edit .env — set MONGO_URI and JWT_SECRET
nodemon server.js        # runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
# Edit .env — REACT_APP_API_URL=http://localhost:5000/api
npm run dev          # runs on http://localhost:3000
```

---

## 🔐 Demo Accounts (seed manually or register)

| Role   | Email             | Password |
|--------|-------------------|----------|
| Admin  | admin@demo.com    | 123456   |
| Mentor | mentor@demo.com   | 123456   |
| Mentee | mentee@demo.com   | 123456   |

---

## 🗺️ API Endpoints

| Method | Endpoint                        | Description              | Auth      |
|--------|---------------------------------|--------------------------|-----------|
| POST   | /api/auth/register              | Register user            | Public    |
| POST   | /api/auth/login                 | Login                    | Public    |
| GET    | /api/auth/me                    | Get current user         | Private   |
| PUT    | /api/auth/profile               | Update basic profile     | Private   |
| GET    | /api/mentors                    | List / search mentors    | Public    |
| GET    | /api/mentors/:id                | Single mentor profile    | Public    |
| GET    | /api/mentors/profile/me         | My mentor profile        | Mentor    |
| PUT    | /api/mentors/profile            | Update mentor profile    | Mentor    |
| POST   | /api/follow/:mentorId           | Follow mentor            | Private   |
| DELETE | /api/follow/:mentorId           | Unfollow mentor          | Private   |
| GET    | /api/follow/following           | My following list        | Private   |
| GET    | /api/follow/check/:mentorId     | Check follow status      | Private   |
| POST   | /api/sessions                   | Book session             | Private   |
| GET    | /api/sessions                   | My sessions              | Private   |
| PUT    | /api/sessions/:id/status        | Accept/reject session    | Private   |
| PUT    | /api/sessions/:id/cancel        | Cancel session           | Private   |
| POST   | /api/feedback                   | Submit review            | Mentee    |
| GET    | /api/feedback/:mentorId         | Get mentor reviews       | Public    |
| GET    | /api/users/analytics            | Platform analytics       | Admin     |
| GET    | /api/users                      | List all users           | Admin     |
| PUT    | /api/users/:id/toggle           | Toggle user active       | Admin     |
| DELETE | /api/users/:id                  | Delete user              | Admin     |

---

## 🛠️ Tech Stack

**Backend:** Node.js · Express.js · MongoDB · Mongoose · JWT · bcryptjs · dotenv · cors · morgan  
**Frontend:** React 18 · React Router v6 · Axios 1.14 · React Toastify · Context API

---

## ✨ Features

- 🔐 JWT Authentication with role-based access (mentor / mentee / admin)
- 🔍 Search & filter mentors by skill, availability, rating
- 👥 Follow / unfollow mentors
- 📅 Session booking with accept/reject flow
- ⭐ Ratings & reviews system
- 🧑‍💼 Admin dashboard with analytics & user management
- 📱 Responsive dark-themed UI

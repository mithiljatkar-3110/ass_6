Online Bookstore - Fullstack Starter
====================================

Structure:
  - backend/  (Node + Express + MySQL)
  - frontend/ (Vite + React)

Quick start:
  1. Backend:
     - cd backend
     - cp .env.example .env  (fill DB credentials and JWT_SECRET)
     - npm install
     - Run database_init.sql in your MySQL (or use a GUI)
     - npm start

  2. Frontend:
     - cd frontend
     - npm install
     - npm run dev
     - Open http://localhost:5173

Notes:
  - API base is http://localhost:4000 by default. Update frontend axios URLs if different.
  - This is a starter template and NOT production-ready. Add proper validation, HTTPS, error handling for production.

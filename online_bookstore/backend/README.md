Backend (Node + Express + MySQL)
--------------------------------
Setup:
  1. Copy .env.example -> .env and fill values.
  2. Run: npm install
  3. Create MySQL database and run the SQL in database_init.sql
  4. Start server: npm run start

Endpoints:
  POST /api/register        {name, email, password}
  POST /api/login           {email, password} -> { token }
  GET  /api/books           -> list of books (public)

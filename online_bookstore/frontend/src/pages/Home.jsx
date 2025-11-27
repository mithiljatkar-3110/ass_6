import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  const isLoggedIn = localStorage.getItem('token')

  return (
    <div className="card">
      <h1>Welcome to Online Bookstore</h1>
      {!isLoggedIn ? (
        <div>
          <p>Please login or register to view our catalog</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/login">
              <button>Login</button>
            </Link>
            <Link to="/register">
              <button>Register</button>
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <p>You are logged in!</p>
          <Link to="/catalog">
            <button>View Catalog</button>
          </Link>
          {localStorage.getItem('is_admin') && (
            <Link to="/admin" style={{marginLeft:'1rem'}}>
              <button>Admin</button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
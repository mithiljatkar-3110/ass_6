import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Catalog from './pages/Catalog'
import Admin from './pages/Admin'
import './styles.css'

function Shell(){
  const navigate = useNavigate()
  const isLoggedIn = !!localStorage.getItem('token')
  return (
    <>
      <nav className="nav">
        <Link to="/">Home</Link>
        {isLoggedIn && <Link to="/catalog">Catalog</Link>}
        {isLoggedIn && localStorage.getItem('is_admin') && <Link to="/admin">Admin</Link>}
        {!isLoggedIn ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <button onClick={()=>{ localStorage.removeItem('token'); localStorage.removeItem('is_admin'); navigate('/'); }}>Logout</button>
        )}
      </nav>
      <div className="container">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/catalog" element={<Catalog/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/admin" element={<Admin/>} />
        </Routes>
      </div>
    </>
  )
}

function App(){
  return (
    <BrowserRouter>
      <Shell/>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(<App />)

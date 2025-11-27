import React, {useState} from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [error,setError]=useState('');
  const navigate = useNavigate();

  async function submit(e){
    e.preventDefault();
    setError('');
    try{
      const res = await axios.post('http://localhost:4000/api/login',{email,password});
      localStorage.setItem('token', res.data.token);
      if (res.data.is_admin) {
        localStorage.setItem('is_admin', '1');
      } else {
        localStorage.removeItem('is_admin');
      }
      alert('Logged in successfully');
      navigate('/');
    }catch(err){
      console.error(err);
      setError(err.response?.data?.error || 'Login failed');
    }
  }

  return (
    <div className="card">
      <h2>Login</h2>
      <form className="form" onSubmit={submit}>
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button type="submit">Login</button>
        {error && <div style={{color:'red'}}>{error}</div>}
      </form>
    </div>
  )
}

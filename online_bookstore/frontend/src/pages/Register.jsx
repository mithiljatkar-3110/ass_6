import React, {useState} from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Register(){
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [error,setError]=useState('');
  const navigate = useNavigate();

  async function submit(e){
    e.preventDefault();
    setError('');
    try{
      await axios.post('http://localhost:4000/api/register',{name,email,password});
      alert('Registered. Please login.');
      navigate('/login');
    }catch(err){
      console.error(err);
      setError(err.response?.data?.error || 'Registration failed');
    }
  }

  return (
    <div className="card">
      <h2>Register</h2>
      <form className="form" onSubmit={submit}>
        <input placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} />
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button type="submit">Register</button>
        {error && <div style={{color:'red'}}>{error}</div>}
      </form>
    </div>
  )
}

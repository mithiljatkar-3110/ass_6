import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Admin(){
  const [books,setBooks] = useState([])
  const [loading,setLoading] = useState(true)
  const [form, setForm] = useState({ title:'', author:'', price:'', cover:'', description:'', stock:'' })
  const navigate = useNavigate()

  useEffect(()=>{
    const token = localStorage.getItem('token')
    const isAdmin = localStorage.getItem('is_admin')
    if (!token || !isAdmin) {
      navigate('/')
      return
    }
    async function load(){
      try{
        const res = await axios.get('http://localhost:4000/api/books', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setBooks(res.data)
      }catch(e){
        console.error(e)
      }finally{
        setLoading(false)
      }
    }
    load()
  },[navigate])

  async function createBook(e){
    e.preventDefault()
    const token = localStorage.getItem('token')
    try{
      const payload = {
        title: form.title,
        author: form.author,
        price: Number(form.price),
        cover: form.cover || undefined,
        description: form.description || undefined,
        stock: form.stock === '' ? 0 : Number(form.stock)
      }
      const res = await axios.post('http://localhost:4000/api/books', payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBooks(prev=> ([...prev, { id: res.data.id, ...payload }]))
      setForm({ title:'', author:'', price:'', cover:'', description:'', stock:'' })
      alert('Book created')
    }catch(e){
      alert(e.response?.data?.error || 'Create failed')
    }
  }

  async function updateStock(id, stock){
    const token = localStorage.getItem('token')
    try{
      await axios.patch(`http://localhost:4000/api/books/${id}`, { stock: Number(stock) }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBooks(prev=> prev.map(b=> b.id===id ? { ...b, stock: Number(stock) } : b))
    }catch(e){
      alert(e.response?.data?.error || 'Update failed')
    }
  }

  async function deleteBook(id){
    const token = localStorage.getItem('token')
    if (!window.confirm('Delete this book?')) return
    try{
      await axios.delete(`http://localhost:4000/api/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBooks(prev=> prev.filter(b=> b.id!==id))
    }catch(e){
      alert(e.response?.data?.error || 'Delete failed')
    }
  }

  return (
    <div>
      <h2>Admin - Manage Books</h2>
      <div className="card" style={{marginBottom:'1rem'}}>
        <h3>Create Book</h3>
        <form className="form" onSubmit={createBook}>
          <input placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
          <input placeholder="Author" value={form.author} onChange={e=>setForm({...form,author:e.target.value})} />
          <input placeholder="Price" type="number" step="0.01" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} />
          <input placeholder="Cover URL" value={form.cover} onChange={e=>setForm({...form,cover:e.target.value})} />
          <textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
          <input placeholder="Stock" type="number" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} />
          <button type="submit">Create</button>
        </form>
      </div>

      {loading ? <div>Loading...</div> : (
        <div className="books-grid">
          {books.map(b=> (
            <div className="book card" key={b.id}>
              <h3>{b.title}</h3>
              <div><em>{b.author}</em></div>
              <div><strong>₹{b.price}</strong></div>
              <div>Stock: {b.stock}</div>
              <div style={{display:'flex', gap:'0.5rem', marginTop:'0.5rem'}}>
                <input type="number" value={b.stock} onChange={e=> setBooks(prev=> prev.map(x=> x.id===b.id ? { ...x, stock: Number(e.target.value) } : x))} style={{width:'6rem'}} />
                <button onClick={()=> updateStock(b.id, books.find(x=>x.id===b.id)?.stock ?? b.stock)}>Save Stock</button>
                <button onClick={()=> deleteBook(b.id)} style={{background:'#c0392b'}}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}



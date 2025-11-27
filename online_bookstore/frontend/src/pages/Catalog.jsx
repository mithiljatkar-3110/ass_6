import React, {useEffect, useState} from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Catalog(){
  const [books,setBooks] = useState([]);
  const [loading,setLoading]=useState(true);
  const navigate = useNavigate();

  useEffect(()=>{
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    async function load(){
      try{
        const res = await axios.get('http://localhost:4000/api/books', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setBooks(res.data);
      }catch(e){
        console.error(e);
        if (e.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/');
        }
      }finally{
        setLoading(false);
      }
    }
    load();
  },[navigate]);

  return (
    <div>
      <h2>Catalog</h2>
      {loading ? <div>Loading...</div> : (
        <div className="books-grid">
          {books.map(b=>(
            <div className="book card" key={b.id}>
              <h3>{b.title}</h3>
              <div><em>{b.author}</em></div>
              <p>{b.description}</p>
              <div><strong>₹{b.price}</strong></div>
              <div>Stock: {b.stock === 0 ? 'Sold' : b.stock}</div>
              <div style={{marginTop:'0.5rem'}}>
                <button disabled={b.stock === 0} onClick={async ()=>{
                  const token = localStorage.getItem('token');
                  try{
                    await axios.post(`http://localhost:4000/api/books/${b.id}/buy`, {}, {
                      headers: { Authorization: `Bearer ${token}` }
                    });
                    setBooks(prev=>prev.map(x=> x.id===b.id ? { ...x, stock: Math.max(0,(x.stock||0)-1) } : x));
                    alert('Purchase successful');
                  }catch(e){
                    alert(e.response?.data?.error || 'Purchase failed');
                  }
                }}>Buy</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const {
  DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, PORT=4000
} = process.env;

if (!DB_HOST) {
  console.warn('Please copy .env.example to .env and set DB credentials and JWT_SECRET');
}

async function getPool(){
  return mysql.createPool({
    host: DB_HOST || 'localhost',
    user: DB_USER || 'root',
    password: DB_PASSWORD || '',
    database: DB_NAME || 'online_bookstore',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}

app.post('/api/register', async (req, res) => {
  const {name, email, password} = req.body;
  if (!name || !email || !password) return res.status(400).json({error:'Missing fields'});
  try{
    const pool = await getPool();
    const [rows] = await pool.query('SELECT id FROM users WHERE email=?',[email]);
    if (rows.length) return res.status(400).json({error:'Email already registered'});
    const hash = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (name,email,password) VALUES (?,?,?)',[name,email,hash]);
    res.json({message:'Registered'});
  }catch(e){
    console.error(e);
    res.status(500).json({error:'Server error'});
  }
});

app.post('/api/login', async (req, res) => {
  const {email, password} = req.body;
  if (!email || !password) return res.status(400).json({error:'Missing fields'});
  try{
    const pool = await getPool();
    const [rows] = await pool.query('SELECT * FROM users WHERE email=?',[email]);
    if (!rows.length) return res.status(400).json({error:'Invalid credentials'});
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({error:'Invalid credentials'});
    const token = jwt.sign({id:user.id,email:user.email,name:user.name,is_admin: !!user.is_admin}, JWT_SECRET || 'secret', {expiresIn:'8h'});
    res.json({token, is_admin: !!user.is_admin});
  }catch(e){
    console.error(e);
    res.status(500).json({error:'Server error'});
  }
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET || 'secret');
    req.user = verified;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const authorizeAdmin = (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ error: 'Admin only' });
  }
  next();
};

app.get('/api/books', authenticateToken, async (req, res) => {
  try{
    const pool = await getPool();
    const [rows] = await pool.query('SELECT id,title,author,price,cover,description,stock FROM books');
    res.json(rows);
  }catch(e){
    console.error(e);
    res.status(500).json({error:'Server error'});
  }
});

app.post('/api/books', authenticateToken, authorizeAdmin, async (req, res) => {
  const { title, author, price, cover, description, stock } = req.body;
  if (!title || !author || price === undefined) {
    return res.status(400).json({ error: 'Missing required fields: title, author, price' });
  }
  try{
    const pool = await getPool();
    const [result] = await pool.query(
      'INSERT INTO books (title, author, price, cover, description, stock) VALUES (?,?,?,?,?,?)',
      [title, author, price, cover || null, description || null, Number.isFinite(Number(stock)) ? Number(stock) : 0]
    );
    res.status(201).json({ id: result.insertId, message: 'Book created' });
  }catch(e){
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/books/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  try{
    const pool = await getPool();
    const [result] = await pool.query('DELETE FROM books WHERE id=?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json({ message: 'Book deleted' });
  }catch(e){
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.patch('/api/books/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  const { title, author, price, cover, description, stock } = req.body;
  if ([title, author, price, cover, description, stock].every(v => v === undefined)) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  const fields = [];
  const values = [];
  if (title !== undefined) { fields.push('title=?'); values.push(title); }
  if (author !== undefined) { fields.push('author=?'); values.push(author); }
  if (price !== undefined) { fields.push('price=?'); values.push(price); }
  if (cover !== undefined) { fields.push('cover=?'); values.push(cover); }
  if (description !== undefined) { fields.push('description=?'); values.push(description); }
  if (stock !== undefined) { fields.push('stock=?'); values.push(Number(stock)); }
  values.push(id);
  try {
    const pool = await getPool();
    const [result] = await pool.query(`UPDATE books SET ${fields.join(', ')} WHERE id=?`, values);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Book not found' });
    res.json({ message: 'Book updated' });
  } catch(e){
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/books/:id/buy', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try{
    const pool = await getPool();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [rows] = await conn.query('SELECT stock FROM books WHERE id=? FOR UPDATE', [id]);
      if (!rows.length) {
        await conn.rollback();
        return res.status(404).json({ error: 'Book not found' });
      }
      const currentStock = rows[0].stock;
      if (currentStock <= 0) {
        await conn.rollback();
        return res.status(400).json({ error: 'Out of stock' });
      }
      await conn.query('UPDATE books SET stock = stock - 1 WHERE id=?', [id]);
      await conn.commit();
      res.json({ message: 'Purchase successful' });
    } catch (e){
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  }catch(e){
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

async function ensureSchema(){
  try{
    const pool = await getPool();
    const dbName = DB_NAME || 'online_bookstore';
    // Ensure users.is_admin exists
    const [userCol] = await pool.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME='users' AND COLUMN_NAME='is_admin'",
      [dbName]
    );
    if (userCol.length === 0) {
      await pool.query('ALTER TABLE users ADD COLUMN is_admin TINYINT(1) DEFAULT 0');
    }
    // Ensure books.stock exists
    const [bookCol] = await pool.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME='books' AND COLUMN_NAME='stock'",
      [dbName]
    );
    if (bookCol.length === 0) {
      await pool.query('ALTER TABLE books ADD COLUMN stock INT DEFAULT 0');
      // Initialize existing rows to 0 if any
      await pool.query('UPDATE books SET stock=0 WHERE stock IS NULL');
    }
  }catch(e){
    console.error('Schema ensure failed:', e);
    // Do not throw: allow server to continue but logs will indicate issue
  }
}

const port = PORT || 4000;
ensureSchema().then(()=>{
  app.listen(port, ()=> console.log('Server running on',port));
});

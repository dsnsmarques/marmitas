const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

db.connect(err => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err);
        return;
    }
    console.log('Conectado ao MySQL');
});

// Tabelas necessárias:
// CREATE TABLE IF NOT EXISTS menu (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), category VARCHAR(50), price DECIMAL(10,2));
// CREATE TABLE IF NOT EXISTS orders (id VARCHAR(50) PRIMARY KEY, customer_name VARCHAR(255), items TEXT, total DECIMAL(10,2), date TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
// CREATE TABLE IF NOT EXISTS config (category VARCHAR(50) PRIMARY KEY, max_items INT, min_items INT);

app.get('/api/menu', (req, res) => {
    db.query('SELECT * FROM menu', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.post('/api/orders', (req, res) => {
    const { id, customer_name, items, total } = req.body;
    db.query('INSERT INTO orders (id, customer_name, items, total) VALUES (?, ?, ?, ?)', 
    [id, customer_name, JSON.stringify(items), total], (err) => {
        if (err) return res.status(500).json(err);
        res.status(201).json({ message: 'Pedido criado' });
    });
});

app.get('/api/orders', (req, res) => {
    db.query('SELECT * FROM orders', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results.map(o => ({ ...o, items: JSON.parse(o.items) })));
    });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Backend rodando na porta ${PORT}`);
});

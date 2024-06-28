const express = require('express');
const app = express();
const port = 3000;
const pool = require('./db');
console.log('Сервер запускается, проверяем подключение к БД...');


// GET /getAllItems
app.get('/getAllItems', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Items');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /addItem?name=TEXT&desc=TEXT2
app.post('/addItem', async (req, res) => {
  const { name, desc } = req.query;
  if (!name || !desc) {
    return res.json(null);
  }
  try {
    const [result] = await pool.query('INSERT INTO Items (name, `desc`) VALUES (?, ?)', [name, desc]);
    const [newItem] = await pool.query('SELECT * FROM Items WHERE id = ?', [result.insertId]);
    res.json(newItem[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /deleteItem?id=number
app.post('/deleteItem', async (req, res) => {
  const { id } = req.query;
  if (!id || isNaN(id)) {
    return res.json(null);
  }
  try {
    const [result] = await pool.query('DELETE FROM Items WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.json({}); // Пустой объект, если элемент не найден
    }
    res.json({ message: 'Item deleted successfully' }); 
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /updateItem?id=number&name=TEXT&desc=TEXT2
app.post('/updateItem', async (req, res) => {
  const { id, name, desc } = req.query;
  if (!id || isNaN(id) || !name || !desc) {
    return res.json(null);
  }
  try {
    const [result] = await pool.query('UPDATE Items SET name = ?, `desc` = ? WHERE id = ?', [name, desc, id]);
    if (result.affectedRows === 0) {
      return res.json({}); // Пустой объект, если элемент не найден
    }
    const [updatedItem] = await pool.query('SELECT * FROM Items WHERE id = ?', [id]);
    res.json(updatedItem[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
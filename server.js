const express = require('express');
const app = express();
const port = 3000;

app.get('/static', (req, res) => {
  res.json({header: "Hello", body: "Octagon NodeJS Test"});
});

app.get('/dynamic', (req, res) => {
  const values = [req.query.a, req.query.b, req.query.c];
  const numbers = [];

  for (let i = 0; i < values.length; i++) {
    const num = parseFloat(values[i]);
    if (isNaN(num)) {
      return res.json({ header: 'Error' });
    }
    numbers.push(num);
  }

  const result = (numbers[0] * numbers[1] * numbers[2]) / 3;
  res.json({ header: 'Calculated', body: result.toString() });
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
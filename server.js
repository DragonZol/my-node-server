const express = require('express');
const app = express();
const port = 3000;

app.get('/static', (req, res) => {
  res.json({header: "Hello", body: "Octagon NodeJS Test"});
});

app.get('/dynamic', (req, res) => {
  const a = parseFloat(req.query.a);
  const b = parseFloat(req.query.b);
  const c = parseFloat(req.query.c);

  if (isNaN(a) || isNaN(b) || isNaN(c)) {
    res.json({ header: 'Error' });
  } else {
    const result = (a * b * c) / 3;
    res.json({ header: 'Calculated', body: result.toString() });
  }
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
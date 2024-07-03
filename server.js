const express = require('express');
const app = express();
const port = 3000;

app.get('/static', (req, res) => {
  res.json({header: "Hello", body: "Octagon NodeJS Test"});
});

app.get('/dynamic', (req, res) => {
  let props = ["a", "b", "c"];
  const numbers = [];

  for (let prop_name of props) {
    if (!req.query[prop_name] || isNaN(parseFloat(req.query[prop_name]))) {
      return res.json({ header: 'Error', message: `Invalid or missing parameter: ${prop_name}` });
    }
    numbers.push(parseFloat(req.query[prop_name]));
  }

  const result = (numbers[0] * numbers[1] * numbers[2]) / 3;
  res.json({ header: 'Calculated', body: result.toString() });
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
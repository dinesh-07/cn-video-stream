const express = require('express');
const app = express();

app.get('/', (req, res) => res.end('login'));
app.post('/segment', (req, res) => res.end('register'));
const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on  ${PORT}`));

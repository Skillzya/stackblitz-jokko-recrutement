// server.js
const express = require('express');
const multer = require('multer');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/upload', upload.single('file'), (req, res) => {
  res.send('Fichier reçu !');
});

app.listen(3000, () => {
  console.log('Serveur lancé sur http://localhost:3000');
});

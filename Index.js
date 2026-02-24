const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // <-- utilise le port dynamique si dispo

// Servir le dossier public
app.use(express.static(path.join(__dirname, 'public')));

// Route principale
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html')); // <- mieux mettre index.html dans public
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});

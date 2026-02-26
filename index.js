const express = require("express");
const app = express();

// Pour lire les POST JSON si tu envoies le formulaire via fetch
app.use(express.json());

// Servir les fichiers statiques (HTML/CSS/JS)
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

// Route test
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html"); // ou juste "Serveur en ligne" si tu veux tester
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

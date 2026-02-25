// Import des modules
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Initialisation de l'app
const app = express();
const PORT = 3000;

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware pour parser le corps des requêtes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration du stockage des CV
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Format: timestamp-nom-prenom.pdf
    const uniqueName = `${Date.now()}-${req.body.nom}-${req.body.prenom}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Configuration de multer avec validation
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limite à 10 Mo
  },
  fileFilter: (req, file, cb) => {
    // Accepter uniquement les fichiers PDF
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF sont acceptés'), false);
    }
  }
});

// Servir le dossier public (où se trouve ton HTML)
app.use(express.static('public'));

// Route pour recevoir le formulaire
app.post('/postuler', upload.single('cv'), (req, res) => {
  try {
    // Extraire les données du formulaire
    const { nom, prenom, email, telephone, linkedin, portfolio } = req.body;
    const cvFile = req.file;

    // Vérifier que tous les champs requis sont présents
    if (!nom || !prenom || !email || !telephone || !cvFile) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs obligatoires doivent être remplis'
      });
    }

    // Créer l'objet candidature
    const candidature = {
      nom,
      prenom,
      email,
      telephone,
      linkedin: linkedin || null,
      portfolio: portfolio || null,
      cv: {
        originalName: cvFile.originalname,
        filename: cvFile.filename,
        path: cvFile.path,
        size: cvFile.size
      },
      dateReception: new Date().toISOString()
    };

    // Sauvegarder dans un fichier JSON (base de données simple)
    const candidaturesFile = './candidatures.json';
    let candidatures = [];

    if (fs.existsSync(candidaturesFile)) {
      const data = fs.readFileSync(candidaturesFile, 'utf8');
      candidatures = JSON.parse(data);
    }

    candidatures.push(candidature);
    fs.writeFileSync(candidaturesFile, JSON.stringify(candidatures, null, 2));

    console.log('📥 Nouvelle candidature reçue:', candidature);

    // Réponse de succès
    res.status(200).json({
      success: true,
      message: 'Candidature envoyée avec succès !',
      data: {
        nom: `${prenom} ${nom}`,
        email: email
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors du traitement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du traitement de votre candidature'
    });
  }
});

// Gestion des erreurs multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Le fichier est trop volumineux (max 10 Mo)'
      });
    }
  }
  
  if (err.message === 'Seuls les fichiers PDF sont acceptés') {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  res.status(500).json({
    success: false,
    message: 'Erreur serveur'
  });
});

// Route pour récupérer toutes les candidatures (optionnel - pour admin)
app.get('/api/candidatures', (req, res) => {
  try {
    const candidaturesFile = './candidatures.json';
    
    if (fs.existsSync(candidaturesFile)) {
      const data = fs.readFileSync(candidaturesFile, 'utf8');
      const candidatures = JSON.parse(data);
      res.json({
        success: true,
        count: candidatures.length,
        candidatures
      });
    } else {
      res.json({
        success: true,
        count: 0,
        candidatures: []
      });
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des candidatures'
    });
  }
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📁 Les CV seront stockés dans: ${path.resolve(uploadsDir)}`);
  console.log(`📋 Les candidatures seront enregistrées dans: candidatures.json`);
});

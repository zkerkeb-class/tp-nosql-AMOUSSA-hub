// Charger les variables d'environnement en PREMIER (avant tout autre import)
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import pokemonsRouter from './routes/pokemons.js';
import connectDB from './db/connect.js'; // Importez la fonction de connexion à la DB

const app = express();

app.use(cors()); // Permet les requêtes cross-origin (ex: frontend sur un autre port)

app.use('/assets', express.static('assets')); // Permet d'accéder aux fichiers dans le dossier "assets" via l'URL /assets/...

app.use(express.json());


app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Utilisation du routeur Pokémon pour toutes les routes /api/pokemons
app.use('/api/pokemons', pokemonsRouter);

// Fonction asynchrone pour démarrer le serveur après la connexion à la DB
const startServer = async () => {
    await connectDB(); // Attendre la connexion à la base de données
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running on http://localhost:${process.env.PORT || 3000}`);
    });
};

startServer(); // Lance le serveur
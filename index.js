// Charger les variables d'environnement en PREMIER (avant tout autre import)
// dotenv lit le fichier .env et rend les variables accessibles via process.env
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import pokemonsList from './data/pokemonsList.js'; // Importez la liste des Pokémon

const app = express();

app.use(cors()); // Permet les requêtes cross-origin (ex: frontend sur un autre port)

app.use('/assets', express.static('assets')); // Permet d'accéder aux fichiers dans le dossier "assets" via l'URL /assets/...

app.use(express.json());


app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Nouvelle route pour obtenir tous les Pokémon
app.get('/api/pokemons', (req, res) => {
    res.json(pokemonsList);
});


app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT || 3000}`);
});
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import pokemonsRouter from './routes/pokemons.js';
import authRouter from './routes/auth.js';
import favoritesRouter from './routes/favorites.js'; // Importez le nouveau routeur de favoris
import connectDB from './db/connect.js'; 

const app = express();

app.use(cors()); 

app.use('/assets', express.static('assets')); 
app.use(express.json());


app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Utilisez les routes d'authentification
app.use('/api/auth', authRouter);
// Utilisez les routes des pokemons
app.use('/api/pokemons', pokemonsRouter);
// Utilisez les routes des favoris
app.use('/api/favorites', favoritesRouter);


const startServer = async () => {
    await connectDB(); 
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running on http://localhost:${process.env.PORT || 3000}`);
    });
};

startServer();
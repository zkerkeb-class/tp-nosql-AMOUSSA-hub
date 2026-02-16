
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import pokemonsRouter from './routes/pokemons.js';
import connectDB from './db/connect.js'; 

const app = express();

app.use(cors()); 

app.use('/assets', express.static('assets')); 
app.use(express.json());


app.get('/', (req, res) => {
    res.send('Hello, World!');
});


app.use('/api/pokemons', pokemonsRouter);


const startServer = async () => {
    await connectDB(); 
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running on http://localhost:${process.env.PORT || 3000}`);
    });
};

startServer(); 
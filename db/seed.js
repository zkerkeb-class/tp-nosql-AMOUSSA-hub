import 'dotenv/config'; 
import mongoose from 'mongoose';
import connectDB from './connect.js';
import Pokemon from '../models/pokemon.js';
import pokemonsList from '../data/pokemons.json' assert { type: 'json' }; 

const seedDB = async () => {
    try {
        await connectDB(); // Connecte à MongoDB

        console.log('Suppression des anciens Pokémon...');
        await Pokemon.deleteMany({});
        console.log('Collection vidée.');

        console.log('Insertion des nouveaux Pokémon...');
        const result = await Pokemon.insertMany(pokemonsList);
        console.log(`${result.length} Pokémon insérés avec succès !`);

    } catch (error) {
        console.error('Erreur lors du seeding de la base de données :', error);
    } finally {
        await mongoose.connection.close();
        console.log('Connexion fermée.');
    }
};

seedDB();
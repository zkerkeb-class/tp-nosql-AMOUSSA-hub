import mongoose from 'mongoose';

const pokemonSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: {
        english: { type: String, required: true },
        japanese: { type: String },
        chinese: { type: String },
        french: { type: String, required: true }
    },
    type: { 
        type: [String], 
        required: true,
        enum :['Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy']
     },
    base: {
        HP: { type: Number, required: true, min: 1, max: 255 },
        Attack: { type: Number, required: true, min: 1, max: 255 },
        Defense: { type: Number, required: true, min: 1, max: 255 },
        SpecialAttack: { type: Number, min: 1, max: 255 },
        SpecialDefense: { type: Number, min: 1, max: 255 },
        Speed: { type: Number, min: 1, max: 255 }
    },
    image: { type: String } // Ajout du champ image
});

const Pokemon = mongoose.model('Pokemon', pokemonSchema);

export default Pokemon;
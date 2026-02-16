import express from 'express';
import pokemonsList from '../data/pokemonsList.js';

const router = express.Router();

// Route pour obtenir tous les Pokémon
router.get('/', (req, res) => {
    res.json(pokemonsList);
});

// Route pour obtenir un Pokémon par ID
router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id); // Convertir l'ID en nombre

    if (isNaN(id)) {
        return res.status(400).json({ message: "L'ID doit être un nombre valide." });
    }

    const pokemon = pokemonsList.find(p => p.id === id);

    if (pokemon) {
        res.status(200).json(pokemon);
    } else {
        res.status(404).json({ message: `Pokémon avec l'ID ${id} non trouvé.` });
    }
});

export default router;
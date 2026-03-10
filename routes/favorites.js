import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/user.js';
import Pokemon from '../models/pokemon.js'; // Pour récupérer les détails des Pokémon favoris

const router = express.Router();

// POST /api/favorites/:pokemonId - Ajouter un Pokémon aux favoris
router.post('/:pokemonId', auth, async (req, res) => {
    try {
        const pokemonId = parseInt(req.params.pokemonId);
        if (isNaN(pokemonId)) {
            return res.status(400).json({ message: "L'ID du Pokémon doit être un nombre valide." });
        }

        
        const pokemonExists = await Pokemon.findOne({ id: pokemonId });
        if (!pokemonExists) {
            return res.status(404).json({ message: `Pokémon avec l'ID ${pokemonId} non trouvé.` });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

       
        user.favorites.addToSet(pokemonId);
        await user.save();

        res.status(200).json({ message: "Pokémon ajouté aux favoris avec succès.", favorites: user.favorites });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'ajout du Pokémon aux favoris.", error: error.message });
    }
});

// DELETE /api/favorites/:pokemonId - Retirer un Pokémon des favoris
router.delete('/:pokemonId', auth, async (req, res) => {
    try {
        const pokemonId = parseInt(req.params.pokemonId);
        if (isNaN(pokemonId)) {
            return res.status(400).json({ message: "L'ID du Pokémon doit être un nombre valide." });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        // Utiliser $pull pour retirer l'ID du tableau
        user.favorites.pull(pokemonId);
        await user.save();

        res.status(200).json({ message: "Pokémon retiré des favoris avec succès.", favorites: user.favorites });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors du retrait du Pokémon des favoris.", error: error.message });
    }
});

// GET /api/favorites - Lister les Pokémon favoris de l'utilisateur
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        // Trouver tous les pokémons qui match les IDs du tableaux de favoris de l'utilisateur
        const favoritePokemons = await Pokemon.find({ id: { $in: user.favorites } });

        res.status(200).json({ favorites: favoritePokemons });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des favoris.", error: error.message });
    }
});

export default router;
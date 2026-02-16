import express from 'express';
import Pokemon from '../models/pokemon.js'; // Importez le modèle Pokemon

const router = express.Router();

// GET /api/pokemons - Retourne tous les Pokémon avec filtres, tri et pagination
router.get('/', async (req, res) => {
    try {
        const { type, name, sort, page, limit } = req.query;
        let filter = {};

        //Filtrer par type
        if (type) {
            filter.type = type;
        }

        // Rechercher par nom
        if (name) {
            filter["name.french"] = { $regex: name, $options: 'i' };
        }

        // Pagination
        const pageNumber = parseInt(page) || 1;
        const limitNumber = parseInt(limit) || 50;
        const skip = (pageNumber - 1) * limitNumber;

        // Compter le total des documents avec les filtres appliqués
        const total = await Pokemon.countDocuments(filter);

        let query = Pokemon.find(filter);

        // Trier les résultats
        if (sort) {
            query = query.sort(sort);
        }

        // Paginer les résultats
        query = query.skip(skip).limit(limitNumber);

        const pokemons = await query;

        const totalPages = Math.ceil(total / limitNumber);

        res.status(200).json({
            data: pokemons,
            page: pageNumber,
            limit: limitNumber,
            total: total,
            totalPages: totalPages
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des Pokémon.", error: error.message });
    }
});

// GET /api/pokemons/:id - Retourne un Pokémon par ID
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ message: "L'ID doit être un nombre valide." });
        }

        const pokemon = await Pokemon.findOne({ id: id }); // Cherche par le champ 'id' du schéma

        if (pokemon) {
            res.status(200).json(pokemon);
        } else {
            res.status(404).json({ message: `Pokémon avec l'ID ${id} non trouvé.` });
        }
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération du Pokémon.", error: error.message });
    }
});

// POST /api/pokemons - Crée un nouveau Pokémon
router.post('/', async (req, res) => {
    try {
        const newPokemon = await Pokemon.create(req.body);
        res.status(201).json(newPokemon);
    } catch (error) {
        // Gérer les erreurs de validation ou de doublon (par exemple, id unique)
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "Données de Pokémon invalides.", error: error.message });
        }
        if (error.code === 11000) { // Code d'erreur pour les doublons (unique: true)
            return res.status(400).json({ message: "Un Pokémon avec cet ID existe déjà.", error: error.message });
        }
        res.status(500).json({ message: "Erreur lors de la création du Pokémon.", error: error.message });
    }
});

// PUT /api/pokemons/:id - Met à jour un Pokémon existant
router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ message: "L'ID doit être un nombre valide." });
        }

        const updatedPokemon = await Pokemon.findOneAndUpdate(
            { id: id }, // Critère de recherche
            req.body,    // Données à mettre à jour
            { new: true, runValidators: true } // Retourne le nouveau document, exécute les validateurs du schéma
        );

        if (updatedPokemon) {
            res.status(200).json(updatedPokemon);
        } else {
            res.status(404).json({ message: `Pokémon avec l'ID ${id} non trouvé.` });
        }
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "Données de mise à jour invalides.", error: error.message });
        }
        res.status(500).json({ message: "Erreur lors de la mise à jour du Pokémon.", error: error.message });
    }
});

// DELETE /api/pokemons/:id - Supprime un Pokémon
router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ message: "L'ID doit être un nombre valide." });
        }

        const deletedPokemon = await Pokemon.findOneAndDelete({ id: id });

        if (deletedPokemon) {
            res.status(204).send(); // 204 No Content pour une suppression réussie
        } else {
            res.status(404).json({ message: `Pokémon avec l'ID ${id} non trouvé.` });
        }
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression du Pokémon.", error: error.message });
    }
});

export default router;
import express from 'express';
import Pokemon from '../models/pokemon.js'; // Importez le modèle Pokemon
import auth from '../middleware/auth.js'; // Importez le middleware d'authentification

const router = express.Router();

// GET /api/pokemons - Retourne tous les Pokémon avec filtres, tri et pagination
router.get('/', async (req, res) => {
    try {
        const { type, name, sort, page, limit } = req.query;
        let filter = {};

        // 4.1 - Filtrer par type
        if (type) {
            filter.type = type;
        }

        // 4.2 - Rechercher par nom
        if (name) {
            filter["name.english"] = { $regex: name, $options: 'i' };
        }

        // Pagination
        const pageNumber = parseInt(page) || 1;
        const limitNumber = parseInt(limit) || 50;
        const skip = (pageNumber - 1) * limitNumber;

        // Compter le total des documents avec les filtres appliqués
        const total = await Pokemon.countDocuments(filter);

        let query = Pokemon.find(filter);

        // 4.3 - Trier les résultats
        if (sort) {
            query = query.sort(sort);
        }

        // 4.4 - Paginer les résultats
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

// POST /api/pokemons - Crée un nouveau Pokémon (protégé)
router.post('/', auth, async (req, res) => {
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

// PUT /api/pokemons/:id - Met à jour un Pokémon existant (protégé)
router.put('/:id', auth, async (req, res) => {
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

// DELETE /api/pokemons/:id - Supprime un Pokémon (protégé)
router.delete('/:id', auth, async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ message: "L'ID doit être un nombre valide." });
        }

        const deletedPokemon = await Pokemon.findOneAndDelete({ id: id });

        if (deletedPokemon) {
            res.status(204).send(); 
        } else {
            res.status(404).json({ message: `Pokémon avec l'ID ${id} non trouvé.` });
        }
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression du Pokémon.", error: error.message });
    }
});

// GET /api/stats - Retourne des statistiques avancées sur les Pokémon
router.get('/stats', async (req, res) => {
    try {
        // Pipeline d'agrégation pour les stats par type
        const typeStatsPipeline = [
            // Étape 1: Déplier le tableau 'type' pour avoir un document par type
            { $unwind: "$type" },
            // Étape 2: Regrouper par type et calculer les stats
            {
                $group: {
                    _id: "$type",
                    count: { $sum: 1 },
                    avgHP: { $avg: "$base.HP" }
                }
            },
            // Étape 3: Renommer _id en typeName pour plus de clarté
            {
                $project: {
                    _id: 0,
                    typeName: "$_id",
                    count: 1,
                    avgHP: { $round: ["$avgHP", 2] } // Arrondir à 2 décimales
                }
            },
            // Étape 4: Trier par nom de type (optionnel)
            { $sort: { typeName: 1 } }
        ];

        const typeStats = await Pokemon.aggregate(typeStatsPipeline);

        // Trouver le Pokémon avec le plus d'attaque
        const strongestAttacker = await Pokemon.findOne().sort({ "base.Attack": -1 }).select('name.english base.Attack').lean();

        // Trouver le Pokémon avec le plus de HP
        const tankiestPokemon = await Pokemon.findOne().sort({ "base.HP": -1 }).select('name.english base.HP').lean();

        // Construire la réponse finale
        const stats = {
            pokemonCountByType: typeStats,
            strongestAttacker: strongestAttacker,
            tankiestPokemon: tankiestPokemon
        };

        res.status(200).json(stats);
    } catch (error) {
        console.error("Erreur lors de la génération des stats :", error);
        res.status(500).json({ message: "Erreur lors de la récupération des statistiques.", error: error.message });
    }
});

export default router;
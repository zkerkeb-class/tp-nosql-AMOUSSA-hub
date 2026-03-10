import express from 'express';
import mongoose from 'mongoose'; // Import de mongoose pour la validation des ObjectId
import auth from '../middleware/auth.js';
import Team from '../models/team.js';
import Pokemon from '../models/pokemon.js';
import User from '../models/user.js'; // Nécessaire pour le populate de l'utilisateur

const router = express.Router();

// POST /api/teams - Créer une nouvelle équipe
router.post('/', auth, async (req, res) => {
    try {
        const { name, pokemonIds } = req.body; // Utilisation de pokemonIds pour plus de clarté
        
        // Validation du nombre de Pokémon
        if (pokemonIds && pokemonIds.length > 6) {
            return res.status(400).json({ 
                message: "Une équipe ne peut pas contenir plus de 6 Pokémon." 
            });
        }
        
        // Vérifier que tous les IDs de Pokémon sont valides (MongoDB _id)
        const validPokemonObjectIds = [];
        if (pokemonIds && pokemonIds.length > 0) {
            for (const id of pokemonIds) {
                if (!mongoose.Types.ObjectId.isValid(id)) {
                    return res.status(400).json({ message: `L'identifiant de Pokémon '${id}' est invalide.` });
                }
                validPokemonObjectIds.push(new mongoose.Types.ObjectId(id));
            }

            const pokemonDocs = await Pokemon.find({
                _id: { $in: validPokemonObjectIds }
            });
            
            if (pokemonDocs.length !== validPokemonObjectIds.length) {
                return res.status(400).json({ 
                    message: "Certains identifiants de Pokémon fournis n'existent pas." 
                });
            }
        }
        
        const team = await Team.create({
            user: req.user.id, // L'ID de l'utilisateur vient du middleware d'authentification
            name,
            pokemons: validPokemonObjectIds // Stocke les ObjectId validés
        });
        
        // Populate les Pokémon et l'utilisateur pour retourner les détails complets
        const populatedTeam = await Team.findById(team._id)
            .populate('pokemons')
            .populate('user', 'username');
        
        res.status(201).json(populatedTeam);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: "Données d'équipe invalides.", 
                error: error.message 
            });
        }
        res.status(500).json({ 
            message: "Erreur lors de la création de l'équipe.", 
            error: error.message 
        });
    }
});

// GET /api/teams - Lister les équipes de l'utilisateur
router.get('/', auth, async (req, res) => {
    try {
        const teams = await Team.find({ user: req.user.id })
            .populate('pokemons')
            .populate('user', 'username')
            .sort({ createdAt: -1 });
        
        res.status(200).json(teams);
    } catch (error) {
        res.status(500).json({ 
            message: "Erreur lors de la récupération des équipes.", 
            error: error.message 
        });
    }
});

// GET /api/teams/:id - Détail d'une équipe
router.get('/:id', auth, async (req, res) => {
    try {
        // Valider si req.params.id est un ObjectId MongoDB valide
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Identifiant d'équipe invalide." });
        }

        const team = await Team.findById(req.params.id)
            .populate('pokemons')
            .populate('user', 'username');
        
        if (!team) {
            return res.status(404).json({ 
                message: "Équipe non trouvée." 
            });
        }
        
        // Vérifier que l'utilisateur est bien le propriétaire de l'équipe
        if (team.user._id.toString() !== req.user.id) {
            return res.status(403).json({ 
                message: "Accès refusé : vous n'êtes pas le propriétaire de cette équipe." 
            });
        }
        
        res.status(200).json(team);
    } catch (error) {
        res.status(500).json({ 
            message: "Erreur lors de la récupération de l'équipe.", 
            error: error.message 
        });
    }
});

// PUT /api/teams/:id - Modifier une équipe
router.put('/:id', auth, async (req, res) => {
    try {
        // Valider si req.params.id est un ObjectId MongoDB valide
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Identifiant d'équipe invalide." });
        }

        const { name, pokemonIds } = req.body; // Utilisation de pokemonIds
        
        // 1. Vérifier l'existence et la propriété de l'équipe
        const existingTeam = await Team.findOne({ _id: req.params.id, user: req.user.id });
        
        if (!existingTeam) {
            return res.status(404).json({ 
                message: "Équipe non trouvée ou vous n'êtes pas le propriétaire." 
            });
        }

        // 2. Validation du nombre de Pokémon si le tableau est fourni
        if (pokemonIds !== undefined && pokemonIds.length > 6) {
            return res.status(400).json({ 
                message: "Une équipe ne peut pas contenir plus de 6 Pokémon." 
            });
        }
        
        // 3. Vérifier que tous les IDs de Pokémon sont valides (MongoDB _id) si le tableau est fourni
        const validPokemonObjectIds = [];
        if (pokemonIds !== undefined && pokemonIds.length > 0) {
            for (const id of pokemonIds) {
                if (!mongoose.Types.ObjectId.isValid(id)) {
                    return res.status(400).json({ message: `L'identifiant de Pokémon '${id}' est invalide.` });
                }
                validPokemonObjectIds.push(new mongoose.Types.ObjectId(id));
            }

            const pokemonDocs = await Pokemon.find({
                _id: { $in: validPokemonObjectIds }
            });
            
            if (pokemonDocs.length !== validPokemonObjectIds.length) {
                return res.status(400).json({ 
                    message: "Certains identifiants de Pokémon fournis n'existent pas." 
                });
            }
        }
        
        // 4. Préparer l'objet de mise à jour (sécurité contre le "mass assignment")
        const updateFields = {};
        if (name !== undefined) updateFields.name = name;
        if (pokemonIds !== undefined) updateFields.pokemons = validPokemonObjectIds; // Stocke les ObjectId validés

        // 5. Effectuer la mise à jour avec updateOne
        const result = await Team.updateOne(
            { _id: req.params.id, user: req.user.id }, // Critère de recherche incluant l'utilisateur
            { $set: updateFields }, // Opérateur $set pour mettre à jour les champs
            { runValidators: true } // Exécuter les validateurs du schéma
        );

        if (result.matchedCount === 0) {
            // Cette condition est une sécurité supplémentaire
            return res.status(404).json({ message: "Équipe non trouvée ou vous n'êtes pas le propriétaire." });
        }

        // 6. Récupérer l'équipe mise à jour pour la réponse
        const updatedTeam = await Team.findById(req.params.id)
            .populate('pokemons')
            .populate('user', 'username');
        
        res.status(200).json(updatedTeam);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: "Données d'équipe invalides.", 
                error: error.message 
            });
        }
        res.status(500).json({ 
            message: "Erreur lors de la mise à jour de l'équipe.", 
            error: error.message 
        });
    }
});

// DELETE /api/teams/:id - Supprimer une équipe
router.delete('/:id', auth, async (req, res) => {
    try {
        // Valider si req.params.id est un ObjectId MongoDB valide
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Identifiant d'équipe invalide." });
        }

        const team = await Team.findById(req.params.id);
        
        if (!team) {
            return res.status(404).json({ 
                message: "Équipe non trouvée." 
            });
        }
        
        // Vérifier que l'utilisateur est bien le propriétaire de l'équipe
        if (team.user.toString() !== req.user.id) {
            return res.status(403).json({ 
                message: "Accès refusé : vous n'êtes pas le propriétaire de cette équipe." 
            });
        }
        
        await Team.findByIdAndDelete(req.params.id);
        
        res.status(200).json({ 
            message: "Équipe supprimée avec succès." 
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Erreur lors de la suppression de l'équipe.", 
            error: error.message 
        });
    }
});

export default router;
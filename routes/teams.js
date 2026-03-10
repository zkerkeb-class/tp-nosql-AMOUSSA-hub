import express from 'express';
import mongoose from 'mongoose';
import auth from '../middleware/auth.js';
import Team from '../models/team.js';
import Pokemon from '../models/pokemon.js';
import User from '../models/user.js';

const router = express.Router();

// POST /api/teams - Créer une nouvelle équipe
router.post('/', auth, async (req, res) => {
    try {
        const { name, pokemonIds } = req.body;
        
        if (pokemonIds && pokemonIds.length > 6) {
            return res.status(400).json({ 
                message: "Une équipe ne peut pas contenir plus de 6 Pokémon." 
            });
        }
        
        const validPokemonNumbers = [];
        if (pokemonIds && pokemonIds.length > 0) {
            for (const id of pokemonIds) {
                const parsedId = parseInt(id);
                if (isNaN(parsedId) || parsedId <= 0) { // Validation pour les IDs numériques
                    return res.status(400).json({ message: `L'identifiant de Pokémon '${id}' est invalide.` });
                }
                validPokemonNumbers.push(parsedId);
            }

            const pokemonDocs = await Pokemon.find({
                id: { $in: validPokemonNumbers } // Recherche par le champ 'id' numérique
            });
            
            if (pokemonDocs.length !== validPokemonNumbers.length) {
                return res.status(400).json({ 
                    message: "Certains identifiants de Pokémon fournis n'existent pas." 
                });
            }
        }
        
        const team = await Team.create({
            user: req.user.id,
            name,
            pokemons: validPokemonNumbers // Stocke les IDs numériques
        });
        
        const populatedTeam = await Team.findById(team._id)
            .populate({
                path: 'pokemons',
                model: 'Pokemon',
                localField: 'pokemons',
                foreignField: 'id'
            })
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
            .populate({
                path: 'pokemons',
                model: 'Pokemon',
                localField: 'pokemons',
                foreignField: 'id',
                select: 'id name.english name.french type' // Sélectionne uniquement l'ID, le nom et le type
            })
            .populate('user', 'username')
            .sort({ createdAt: -1 });
        
        const totalTeams = teams.length;
        const teamNames = teams.map(team => team.name);

        res.status(200).json({
            totalTeams,
            teamNames,
            teams
        });
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
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Identifiant d'équipe invalide." });
        }

        const team = await Team.findById(req.params.id)
            .populate({
                path: 'pokemons',
                model: 'Pokemon',
                localField: 'pokemons',
                foreignField: 'id'
            })
            .populate('user', 'username');
        
        if (!team) {
            return res.status(404).json({ 
                message: "Équipe non trouvée." 
            });
        }
        
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
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Identifiant d'équipe invalide." });
        }

        const { name, pokemonIds } = req.body;
        
        const existingTeam = await Team.findOne({ _id: req.params.id, user: req.user.id });
        
        if (!existingTeam) {
            return res.status(404).json({ 
                message: "Équipe non trouvée ou vous n'êtes pas le propriétaire." 
            });
        }

        if (pokemonIds !== undefined && pokemonIds.length > 6) {
            return res.status(400).json({ 
                message: "Une équipe ne peut pas contenir plus de 6 Pokémon." 
            });
        }
        
        const validPokemonNumbers = [];
        if (pokemonIds !== undefined && pokemonIds.length > 0) {
            for (const id of pokemonIds) {
                const parsedId = parseInt(id);
                if (isNaN(parsedId) || parsedId <= 0) {
                    return res.status(400).json({ message: `L'identifiant de Pokémon '${id}' est invalide.` });
                }
                validPokemonNumbers.push(parsedId);
            }

            const pokemonDocs = await Pokemon.find({
                id: { $in: validPokemonNumbers }
            });
            
            if (pokemonDocs.length !== validPokemonNumbers.length) {
                return res.status(400).json({ 
                    message: "Certains identifiants de Pokémon fournis n'existent pas." 
                });
            }
        }
        
        const updateFields = {};
        if (name !== undefined) updateFields.name = name;
        if (pokemonIds !== undefined) updateFields.pokemons = validPokemonNumbers;

        const result = await Team.updateOne(
            { _id: req.params.id, user: req.user.id },
            { $set: updateFields },
            { runValidators: true }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Équipe non trouvée ou vous n'êtes pas le propriétaire." });
        }

        const updatedTeam = await Team.findById(req.params.id)
            .populate({
                path: 'pokemons',
                model: 'Pokemon',
                localField: 'pokemons',
                foreignField: 'id'
            })
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
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Identifiant d'équipe invalide." });
        }

        const team = await Team.findById(req.params.id);
        
        if (!team) {
            return res.status(404).json({ 
                message: "Équipe non trouvée." 
            });
        }
        
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
import express from 'express';
import Pokemon from '../models/pokemon.js'; // Importez le modèle Pokemon

const router = express.Router();

// GET /api/pokemons - Retourne tous les Pokémon
router.get('/', async (req, res) => {
    try {
        const pokemons = await Pokemon.find();
        res.status(200).json(pokemons);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des Pokémon.", error: error.message });
    }
});Partie 3 — CRUD complet avec Mongoose
~4h
 · Moyen
Maintenant que la base est remplie, remplacez les routes de la Partie 1 pour qu'elles lisent et écrivent dans MongoDB au lieu du fichier JSON.
Étape 3.1 — READ : Lister et chercher
Modifiez vos routes dans routes/pokemons.js
 :
GET /api/pokemons
Retournez tous les Pokémon depuis MongoDB avec Pokemon.find()
GET /api/pokemons/:id
Cherchez un Pokémon par son champ id
 avec Pokemon.findOne()
Retournez 404 si non trouvé
Indice
Étape 3.2 — CREATE : Ajouter un Pokémon
POST /api/pokemons
Récupérez les données du body (req.body
)
Créez le Pokémon en base avec Pokemon.create()
Retournez le Pokémon créé avec le status 201
En cas d'erreur (validation, doublon...), retournez une 400 avec le message d'erreur
Testez avec Thunder Client / curl
POST http://localhost:3000/api/pokemons
Content-Type: application/json

{
  "id": 152,
  "name": { "english": "Chikorita", "french": "Germignon" },
  "type": ["Grass"],
  "base": { "HP": 45, "Attack": 49, "Defense": 65 }
}
​
Étape 3.3 — UPDATE : Modifier un Pokémon
PUT /api/pokemons/:id
Cherchez le Pokémon par id
Mettez à jour ses champs avec les données du body
Utilisez Pokemon.findOneAndUpdate()
 avec l'option { new: true }
 pour retourner le document mis à jour
Retournez 404 si le Pokémon n'existe pas
Indice
Étape 3.4 — DELETE : Supprimer un Pokémon
DELETE /api/pokemons/:id
Supprimez le Pokémon avec Pokemon.findOneAndDelete()
Retournez 404 si le Pokémon n'existait pas
Retournez le status 204 (No Content) si la suppression a réussi
Étape 3.5 — Gestion des erreurs
Vos routes peuvent planter (MongoDB down, données invalides...). Entourez chaque route d'un try/catch
 :
router.get('/:id', async (req, res) => {
  try {
    const pokemon = await Pokemon.findOne({ id: req.params.id });
    if (!pokemon) return res.status(404).json({ error: 'Pokémon non trouvé' });
    res.json(pokemon);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
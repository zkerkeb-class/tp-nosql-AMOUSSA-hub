import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const router = express.Router();

// POST /api/auth/register - Inscription d'un nouvel utilisateur
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Le nom d'utilisateur et le mot de passe sont requis." });
        }

        const user = await User.create({ username, password });
        res.status(201).json({ message: "Utilisateur enregistré avec succès !", userId: user._id });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'inscription de l'utilisateur.", error: error.message });
    }
});

// POST /api/auth/login - Connexion d'un utilisateur existant
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Le nom d'utilisateur et le mot de passe sont requis." });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: "Nom d'utilisateur ou mot de passe invalide." });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Nom d'utilisateur ou mot de passe invalide." });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la connexion.", error: error.message });
    }
});

export default router;
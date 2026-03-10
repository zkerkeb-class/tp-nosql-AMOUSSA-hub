import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Authentification requise : Token non fourni ou mal formaté." });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "Authentification requise : Token manquant." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Ajoute l'utilisateur décodé à l'objet requête
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Token invalide." });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expiré." });
        }
        res.status(500).json({ message: "Erreur d'authentification.", error: error.message });
    }
};

export default auth;
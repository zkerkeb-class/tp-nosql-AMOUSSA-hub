import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        unique:  true,
        required: [true, "Le nom de l'équipe est requis."],
        trim: true,
        maxlength: [50, "Le nom de l'équipe ne peut pas dépasser 50 caractères."]
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    pokemons: [{
        type: Number, 
        ref: 'Pokemon'
        // Le validateur de taille de tableau est supprimé d'ici
        // car la validation est déjà gérée dans les routes (routes/teams.js)
    }]
}, { timestamps: true }); 

const Team = mongoose.model('Team', teamSchema);

export default Team;
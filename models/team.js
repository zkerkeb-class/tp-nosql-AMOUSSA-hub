import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pokemon',
        validate: {
            validator: function(v) {
                return v.length <= 6;
            },
            message: props => `Une équipe ne peut pas contenir plus de 6 Pokémon, mais a reçu ${props.value.length}.`
        }
    }]
}, { timestamps: true }); // Ajoute automatiquement createdAt et updatedAt

const Team = mongoose.model('Team', teamSchema);

export default Team;
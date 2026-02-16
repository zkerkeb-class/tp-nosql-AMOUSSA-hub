import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Le nom d'utilisateur est requis."],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Le mot de passe est requis."]
    }
});

// Middleware pre-save pour hasher le mot de passe avant de l'enregistrer
userSchema.pre('save', function (next) { // Retiré 'async' ici
    if (!this.isModified('password')) {
        return next();
    }
    const user = this; // Capture le contexte 'this'
    bcrypt.genSalt(10)
        .then(salt => bcrypt.hash(user.password, salt))
        .then(hash => {
            user.password = hash;
            next(); // Appelle next() après le hachage réussi
        })
        .catch(err => {
            console.error('Erreur lors du hachage du mot de passe :', err);
            next(err); // Passe l'erreur à Mongoose
        });
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
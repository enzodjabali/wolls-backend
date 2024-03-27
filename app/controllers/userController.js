const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { createUserSchema, updateUserSchema } = require('../middlewares/validationSchema');

const registerUser = async (req, res) => {
    try {
        await createUserSchema.validateAsync(req.body);

        // Extract data from request body
        let { firstname, lastname, pseudonym, email, password, confirmPassword } = req.body;

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ error: "Passwords do not match" });
        }

        // Hash the password
        password = await bcrypt.hash(password, 10);

        // Check if email and pseudonym are unique
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ error: "Email already exists" });
        }

        const pseudonymExists = await User.findOne({ pseudonym });
        if (pseudonymExists) {
            return res.status(400).json({ error: "Pseudonym already exists" });
        }

        // Create new user instance
        const user = new User({
            firstname,
            lastname,
            pseudonym,
            email,
            password
        });

        // Save user to database
        const savedUser = await user.save();

        res.status(201).json(savedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const authenticateUser = async (req, res) => {
    try {
        let { pseudonym, password } = req.body;

        // Find the user by pseudo
        const user = await User.findOne({ pseudonym });

        if (!user) {
            return res.status(401).json({ error: 'Pseudo ou mot de passe incorrect' });
        }

        // Compare the password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Pseudo ou mot de passe incorrect' });
        }

        // Create and send a JWT token
        const token = jwt.sign({ userId: user._id }, 'secret_key', { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la connexion. Veuillez réessayer.' });
    }
};


const getUsersList = async (req, res) => {
    User.find({}, '_id pseudonym')
        .then(result => {
            res.status(200).json(result);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: 'Internal Server Error' })
        });
};

const getCurrentUser = async (req, res) => {
    try {
        const currentUser = await User.findOne({ _id: req.userId }, { _id: 1, firstname: 1, lastname: 1, pseudonym: 1, email: 1 });
        res.status(200).json(currentUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateCurrentUser = async (req, res) => {
    try {
        // Récupérer l'utilisateur actuel
        const currentUser = await User.findById(req.userId);

        // Vérifier si le mot de passe est fourni et s'il correspond à celui enregistré en base de données
        if (req.body.password !== undefined && req.body.password !== null) {
            const isPasswordValid = await bcrypt.compare(req.body.password, currentUser.password);
            if (!isPasswordValid) {
                return res.status(400).json({ error: 'Invalid password' });
            }
            // Supprimer le champ password pour éviter qu'il ne soit mis à jour
            delete req.body.password;
        }

        // Supprimer le champ confirmPassword s'il est présent dans la requête
        if (req.body.confirmPassword) {
            delete req.body.confirmPassword;
        }

        // Vérifier si d'autres champs que firstname, lastname, pseudonym et email sont fournis et les supprimer
        const allowedFields = ['firstname', 'lastname', 'pseudonym', 'email'];
        Object.keys(req.body).forEach(key => {
            if (!allowedFields.includes(key)) {
                delete req.body[key];
            }
        });

        // Valider le schéma de mise à jour
        await updateUserSchema.validateAsync(req.body);

        // Mettre à jour l'utilisateur
        const result = await User.findByIdAndUpdate(req.userId, req.body);

        // Vérifier si l'utilisateur a été trouvé et mis à jour
        if (result) {
            res.status(200).send('You have successfully updated your account');
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const logoutUser = (req, res) => {
    try {
        res.clearCookie('jwt');
        res.status(200).json({ message: 'Vous êtes désormais déconnecté' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { logoutUser };


const deleteCurrentUser = (req, res) => {
    User.findByIdAndDelete({_id: req.userId})
        .then(result => {
            res.send('Your account has been successfully deleted');
        })
        .catch(err => {
            console.log(err);
        });
};

module.exports = { registerUser, authenticateUser, getUsersList, getCurrentUser, updateCurrentUser, logoutUser, deleteCurrentUser };

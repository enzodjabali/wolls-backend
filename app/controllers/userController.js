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
            return res.status(400).json({ error: "Les mots de passe ne correspondent pas" });
        }

        // Hash the password
        password = await bcrypt.hash(password, 10);

        // Check if email and pseudonym are unique
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ error: "L'email existe déjà" });
        }

        const pseudonymExists = await User.findOne({ pseudonym });
        if (pseudonymExists) {
            return res.status(400).json({ error: "Le pseudo existe déjà" });
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
        // Get the user
        const currentUser = await User.findById(req.userId);

        // Checks if the password is provided and if it matches the one saved in the database
        if (req.body.password !== undefined && req.body.password !== null) {
            const isPasswordValid = await bcrypt.compare(req.body.password, currentUser.password);
            if (!isPasswordValid) {
                return res.status(400).json({ error: 'Invalid password' });
            }
            // Remove the password field to prevent it from being updated
            delete req.body.password;
        }

        // Remove the confirmPassword field if it is present in the query
        if (req.body.confirmPassword) {
            delete req.body.confirmPassword;
        }

        // Checks if fields other than firstname, lastname, nickname and email are provided and removes them
        const allowedFields = ['firstname', 'lastname', 'pseudonym', 'email'];
        Object.keys(req.body).forEach(key => {
            if (!allowedFields.includes(key)) {
                delete req.body[key];
            }
        });

        // Validate the update schema and updates the user
        await updateUserSchema.validateAsync(req.body);
        const result = await User.findByIdAndUpdate(req.userId, req.body);

        // Checks if user was found and updated
        if (result) {
            res.status(200).send('Votre compte a été mis à jour');
        } else {
            res.status(404).json({ error: 'Utilisateur introuvable' });
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

const deleteCurrentUser = (req, res) => {
    User.findByIdAndDelete({_id: req.userId})
        .then(result => {
            res.send('Votre compte a bien été supprimé');
        })
        .catch(err => {
            console.log(err);
        });
};

const getUserById = async (req, res) => {
    const userId = req.params.id; // Extract user ID from request parameters

    try {
        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Return only the pseudonym field
        res.status(200).json({ pseudonym: user.pseudonym });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { registerUser, authenticateUser, getUsersList, getCurrentUser, updateCurrentUser, logoutUser, deleteCurrentUser, getUserById };

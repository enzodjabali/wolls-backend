const User = require('../models/User');
const ForgotPassword = require('../models/ForgotPassword');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { createUserSchema, updateUserSchema } = require('../middlewares/validationSchema');
const sendEmail = require('../middlewares/sendEmail');

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

const authenticateUserWithGoogle = async (req, res) => {
    try {
        const { googleToken } = req.body;

        // Split the token by '.'
        const tokenParts = googleToken.split('.');

        // Decode the payload part which is the second part of the token
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString('utf-8'));

        // Extract the required information
        const { email, given_name, family_name } = payload;

        // Check if the user already exists in the database
        let user = await User.findOne({ email });

        // If user doesn't exist, create a new user
        if (!user) {
            const newUser = new User({
                firstname: given_name,
                lastname: family_name,
                pseudonym: given_name, // You may adjust this logic if needed
                email: email,
                password: '', // Password not needed for Google login
                isGoogle: true
            });
            user = await newUser.save();
        } else {
            // Update user's information if necessary
            if (given_name !== user.firstname || family_name !== user.lastname) {
                user.firstname = given_name;
                user.lastname = family_name;
                user.pseudonym = given_name; // You may adjust this logic if needed
                await user.save();
            }
        }

        // Create JWT token
        const token = jwt.sign({ userId: user._id }, 'secret_key', { expiresIn: '1h' });

        // Return the JWT token
        res.status(200).json({ token });
    } catch (error) {
        console.error('Error authenticating with Google:', error);
        res.status(500).json({ error: 'Internal server error' });
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
        // Remove the password-related fields from the request body
        delete req.body.password;
        delete req.body.confirmPassword;

        // Checks if fields other than firstname, lastname, pseudonym, and email are provided and removes them
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

const updatePasswordCurrentUser = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Get the user
        const currentUser = await User.findById(req.userId);

        // Checks if the current password matches the one saved in the database
        const isPasswordValid = await bcrypt.compare(currentPassword, currentUser.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Mot de passe actuel incorrect' });
        }

        // Validate the new password and confirm password
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: 'Les nouveaux mots de passe ne correspondent pas' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password
        await User.findByIdAndUpdate(req.userId, { password: hashedPassword });

        res.status(200).send('Votre mot de passe a été mis à jour avec succès');
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

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if there is an existing entry for this email in the ForgotPassword model
        const existingEntry = await ForgotPassword.findOne({ email });

        // If an existing entry is found, delete it
        if (existingEntry) {
            await ForgotPassword.findOneAndDelete({ email });
        }

        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate a random verification code (you can use any method you prefer)
        const verificationCode = Math.floor(100000 + Math.random() * 900000); // 6-digit code

        // Store the verification code with the user's email in the ForgotPassword model
        const forgotPasswordEntry = new ForgotPassword({
            email: email,
            code: verificationCode
        });
        await forgotPasswordEntry.save();

        // Send the verification code to the user's email
        const subject = 'Password Reset Verification Code';
        const text = `Your verification code is: ${verificationCode}`;
        const emailSent = await sendEmail(email, subject, text);

        if (emailSent) {
            return res.status(200).json({ message: "Verification code sent successfully. Don't forget to check your junks" });
        } else {
            return res.status(500).json({ message: "Failed to send verification code" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword, confirmNewPassword } = req.body;

        // Find the entry in the ForgotPassword model
        const forgotPasswordEntry = await ForgotPassword.findOne({ email, code });

        if (!forgotPasswordEntry) {
            return res.status(404).json({ message: 'Invalid verification code or email' });
        }

        // Check if the forgot password code is expired (created more than 10 minutes ago)
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        if (forgotPasswordEntry.createdAt < tenMinutesAgo) {
            // Code is expired
            return res.status(400).json({ message: 'Forgot password code has expired' });
        }

        // Check if the new password and confirm new password match
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: 'New password and confirm password do not match' });
        }

        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        // Delete the entry from the ForgotPassword model
        await ForgotPassword.findOneAndDelete({ email, code });

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { registerUser, authenticateUser, getUsersList, getCurrentUser, updateCurrentUser, updatePasswordCurrentUser, logoutUser, deleteCurrentUser, getUserById, authenticateUserWithGoogle, forgotPassword, resetPassword };

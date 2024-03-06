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


const loginUser = async (req, res) => {
    try {
        let { pseudonym, password } = req.body;

        // Find the user in the database
        const user = await User.findOne({ pseudonym });

        if (!user) {
            return res.status(401).json({ error: 'Invalid pseudonym or password' });
        }

        // Compare the password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid pseudonym or password' });
        }

        // Create and send a JWT token
        const token = jwt.sign({ userId: user._id }, 'secret_key', { expiresIn: '1d' }); // expires in 1 day
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const getAllUsers = async (req, res) => {
    User.find()
    .then(result => {
        res.status(200).json(result);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' })
    });
};

const whoami = async (req, res) => {
    try {
        User.findOne({_id: req.userId}).then(function(currentUser) {
            res.status(200).json({ currentUser });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateMyself = async (req, res) => {
    req.body.password = req.body.password == null ? req.body.password : await bcrypt.hash(req.body.password, 10);

    try {
        await updateUserSchema.validateAsync(req.body);

        User.findByIdAndUpdate({_id: req.userId}, req.body)
            .then(result => {
                if (result) {
                    res.status(200).send('You have successfully updated your account'); // 200 OK
                } else {
                    res.status(404).json({ error: 'User not found' }); // 404 Not Found
                }
            })
            .catch(err => {
                console.error(err);
                res.status(500).json({ error: 'Internal Server Error' }); // 500 Internal Server Error
            });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteUser = (req, res) => {
    User.findByIdAndDelete({_id: req.userId})
        .then(result => {
            res.send('Your account has been successfully deleted');
        })
        .catch(err => {
            console.log(err);
        });
};

module.exports = { registerUser, loginUser, getAllUsers, whoami, updateMyself, deleteUser };

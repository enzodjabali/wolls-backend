const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { createUserSchema, updateUserSchema } = require('../middlewares/validationSchema');

const registerUser = async (req, res) => {
    try {
        await createUserSchema.validateAsync(req.body);

        let username = req.body.username;
        let email = req.body.email;
        let password = await bcrypt.hash(req.body.password, 10);
        let role = "USER";

        const user = new User({
            username: username,
            email: email,
            password: password,
            role: role,
        });

        user.save()
            .then(result => {
                res.status(201).json(result)
            })
            .catch(err => {
                console.log(err)
                res.status(500).json({error: 'Internal Server Error'});
            })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        let username = req.body.username;
        let password = req.body.password;

        // Find the user in the database
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Compare the password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Create and send a JWT token
        const token = jwt.sign({ userId: user._id }, 'secret_key', { expiresIn: '1d' }); // expires in 1 day 
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllUsers = async (req, res) => {
    const currentUser = await User.findOne({_id: req.userId});

    if (currentUser.role == "EMPLOYEE" || currentUser.role == "ADMIN") {
        User.find()
        .then(result => {
            res.status(200).json(result);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: 'Internal Server Error' })
        });
    } else {
        res.status(403).json({ error: 'You do not have the suffisant privilieges to perform this action'})
    }
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
    const currentUser = await User.findOne({_id: req.userId});

    req.body.role = currentUser.role;    
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

const updateUser = async (req, res) => {
    try {
        await updateUserSchema.validateAsync(req.body);

        const currentUser = await User.findOne({_id: req.userId});

        req.body.password = req.body.password == null ? req.body.password : await bcrypt.hash(req.body.password, 10);

        if (currentUser.role == "ADMIN") {
            const id = req.params.id;

            User.findByIdAndUpdate(id , req.body)
                .then(result => {
                    if (result) {
                        res.status(200).send('The user has been successfully updated'); // 200 OK
                    } else {
                        res.status(404).json({ error: 'User not found' }); // 404 Not Found
                    }
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).json({ error: 'Internal Server Error' }); // 500 Internal Server Error
                });
        } else {
            res.status(403).json({ error: 'You do not have the suffisant privilieges to perform this action'})
        }
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

module.exports = { registerUser, loginUser, getAllUsers, whoami, updateMyself, updateUser, deleteUser };

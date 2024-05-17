const User = require('../models/User');
const ForgotPassword = require('../models/ForgotPassword');
const GroupMembership = require('../models/GroupMembership');
const LOCALE = require('../locales/fr-FR');
const sendEmail = require('../middlewares/sendEmail');
const minioClient = require('../middlewares/minioClient');
const { createUserSchema, updateUserSchema } = require('../middlewares/validationSchema');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

/**
 * Registers a new user
 * @param {Object} req The request object containing user registration data in req.body
 * @param {Object} res The response object to send the result
 * @returns {Object} Returns the saved user data if successful, otherwise returns an error response
 */
const registerUser = async (req, res) => {
    try {
        await createUserSchema.validateAsync(req.body);

        let { firstname, lastname, pseudonym, email, password, confirmPassword } = req.body;

        const emailExists = await User.findOne({ email });
        const pseudonymExists = await User.findOne({ pseudonym });

        if (password !== confirmPassword) {
            return res.status(400).json({ error: LOCALE.passwordsNotMatching });
        }

        password = await bcrypt.hash(password, 10);

        if (emailExists) {
            return res.status(400).json({ error: LOCALE.emailAlreadyExists });
        }

        if (pseudonymExists) {
            return res.status(400).json({ error: LOCALE.pseudonymAlreadyExists });
        }

        const user = new User({
            firstname,
            lastname,
            pseudonym,
            email,
            password
        });

        const savedUser = await user.save();

        res.status(201).json(savedUser);
    } catch (error) {
        if (error.name === 'ValidationError' && error.isJoi) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            return res.status(400).json({ error: errorMessage });
        }
        console.error('Error logging in the user:', error);
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

/**
 * Authenticates a user by verifying their pseudonym and password and sends back a JWT token
 * @param {Object} req The request object containing user credentials (pseudonym and password) in req.body
 * @param {Object} res The response object to send the JWT token or an error response
 * @returns {Object} Returns a JWT token if authentication is successful, otherwise returns an error response
 */
const authenticateUser = async (req, res) => {
    try {
        let { pseudonym, password } = req.body;

        const user = await User.findOne({ pseudonym });

        if (!user) {
            return res.status(401).json({ error: LOCALE.wrongPasswordOrPseudonym });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: LOCALE.wrongPasswordOrPseudonym });
        }

        const token = jwt.sign({ userId: user._id }, 'secret_key', { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        console.error('Error logging in the user:', error);
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

/**
 * Authenticates a user with a Google token, creates a new user if not exists in the database, and sends back a JWT token
 * @param {Object} req The request object containing the Google token in req.body.googleToken
 * @param {Object} res The response object to send the JWT token or an error response
 * @returns {Object} Returns a JWT token if authentication is successful, otherwise returns an error response
 */
const authenticateUserWithGoogle = async (req, res) => {
    try {
        const { googleToken } = req.body;

        if (!googleToken || typeof googleToken !== 'string') {
            return res.status(400).json({ error: LOCALE.invalidGoogleToken });
        }

        const tokenParts = googleToken.split('.');
        if (tokenParts.length !== 3) {
            return res.status(400).json({ error: LOCALE.invalidGoogleToken });
        }

        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString('utf-8'));
        const { email, name, given_name, family_name } = payload;
        const modifiedNameToPseudonym = (name.replace(/\s/g, '') + Math.floor(Math.random() * 10000).toString().padStart(4, '0')).toLowerCase();
        let user = await User.findOne({ email });

        if (!user) {
            const newUser = new User({
                firstname: given_name,
                lastname: family_name,
                pseudonym: modifiedNameToPseudonym,
                email: email,
                password: '',
                isGoogle: true
            });
            user = await newUser.save();
        } else {
            if (given_name !== user.firstname || family_name !== user.lastname) {
                user.firstname = given_name;
                user.lastname = family_name;
                await user.save();
            }
        }

        const token = jwt.sign({ userId: user._id }, 'secret_key', { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        console.error('Error logging in user with google:', error);
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

/**
 * Retrieves a list of users containing their IDs and pseudonyms
 * @param {Object} req The request object
 * @param {Object} res The response object to send the list of users or an error response
 * @returns {Object} Returns a list of users if successful, otherwise returns an error response
 */
const getUsersList = async (req, res) => {
    User.find({}, '_id pseudonym')
        .then(result => {
            res.status(200).json(result);
        })
        .catch(err => {
            console.error('Error fetching the users:', error);
            res.status(500).json({ error: LOCALE.internalServerError })
        });
};

/**
 * Retrieves the details of the current user based on their userId
 * @param {Object} req The request object containing the userId in req.userId
 * @param {Object} res The response object to send the current user's details or an error response
 * @returns {Object} Returns the current user's details if successful, otherwise returns an error response
 */
const getCurrentUser = async (req, res) => {
    try {
        const currentUser = await User.findOne({ _id: req.userId });

        if (!currentUser) {
            return res.status(404).json({ error: LOCALE.userNotFound });
        }

        const userData = {
            _id: currentUser._id,
            firstname: currentUser.firstname,
            lastname: currentUser.lastname,
            pseudonym: currentUser.pseudonym,
            email: currentUser.email,
            iban: currentUser.iban,
            ibanAttachment: currentUser.ibanAttachment
        };

        if (currentUser.ibanAttachment) {
            const bucketName = 'user-ibans';
            const fileName = currentUser.ibanAttachment;

            const dataChunks = [];
            const dataStream = await minioClient.getObject(bucketName, fileName);

            dataStream.on('data', function (chunk) {
                dataChunks.push(chunk);
            });

            dataStream.on('end', function () {
                const concatenatedBuffer = Buffer.concat(dataChunks);
                const base64Data = concatenatedBuffer.toString('base64');

                userData.ibanAttachment = {
                    fileName,
                    content: base64Data
                };

                res.status(200).json(userData);
            });

            dataStream.on('error', function (err) {
                console.error('Error fetching the user iban attachment:', error);
                res.status(500).json({ error: LOCALE.internalServerError });
            });
        } else {
            res.status(200).json(userData);
        }
    } catch (error) {
        console.error('Error fetching the current user:', error);
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

/**
 * Updates the details of the current user
 * @param {Object} req The request object containing the updated user details in req.body and the userId in req.userId
 * @param {Object} res The response object to send a success message or an error response
 * @returns {Object} Returns a success message if the update is successful, otherwise returns an error response
 */
const updateCurrentUser = async (req, res) => {
    try {
        const currentUser = await User.findById(req.userId);

        delete req.body.password;
        delete req.body.confirmPassword;

        const forbiddenFieldsForGoogleUsers = ['firstname', 'lastname', 'pseudonym', 'email'];
        const allowedFields = ['firstname', 'lastname', 'pseudonym', 'email', 'iban', 'ibanAttachment'];

        if (currentUser && currentUser.isGoogle) {
            const forbiddenFields = [];
            forbiddenFieldsForGoogleUsers.forEach(field => {
                if (req.body[field]) {
                    forbiddenFields.push(field);
                }
            });

            if (forbiddenFields.length > 0) {
                return res.status(400).json({ error: LOCALE.googleUserCannotUpdateAccount });
            }
        }

        Object.keys(req.body).forEach(key => {
            if (!allowedFields.includes(key)) {
                delete req.body[key];
            }
        });

        await updateUserSchema.validateAsync(req.body, { abortEarly: false });

        if (req.body.ibanAttachment) {
            const attachmentData = req.body.ibanAttachment;

            if (!attachmentData || !attachmentData.filename || !attachmentData.content) {
                return res.status(400).json({ error: LOCALE.ibanMalformed });
            }

            const decodedFileContent = Buffer.from(attachmentData.content, 'base64');

            if (!decodedFileContent.toString('utf8').startsWith('%PDF-')) {
                return res.status(400).json({ error: LOCALE.ibanMustPdf });
            }

            if (currentUser.ibanAttachment) {
                const bucketName = 'user-ibans';
                const existingFileName = currentUser.ibanAttachment;
                try {
                    await minioClient.removeObject(bucketName, existingFileName);
                } catch (deleteError) {
                    console.error('Error deleting existing IBAN attachment from S3:', deleteError);
                    res.status(500).json({ error: LOCALE.internalServerError });
                }
            }

            const bucketName = 'user-ibans';
            const fileName = `${uuidv4()}.pdf`;
            const metaData = {
                'Content-Type': 'application/pdf'
            };

            try {
                await minioClient.putObject(bucketName, fileName, decodedFileContent, decodedFileContent.length, metaData);
            } catch (uploadError) {
                console.error('Error uploading IBAN attachment to S3:', uploadError);
                return res.status(500).json({ error: LOCALE.internalServerError });
            }

            req.body.ibanAttachment = fileName;
        }

        const updatedUser = await User.findByIdAndUpdate(req.userId, req.body);

        if (updatedUser) {
            res.status(200).send(updatedUser);
        } else {
            res.status(404).json({ error: LOCALE.userNotFound });
        }
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            return res.status(400).json({ error: errorMessage });
        }

        console.error('Error updating current user:', error);
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

/**
 * Updates the password of the current user
 * @param {Object} req The request object containing the currentPassword, newPassword, and confirmPassword in req.body, and the userId in req.userId
 * @param {Object} res The response object to send a success message or an error response
 * @returns {Object} Returns a success message if the password update is successful, otherwise returns an error response
 */
const updateCurrentUserPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || typeof currentPassword !== 'string') {
            return res.status(400).json({ error: LOCALE.wrongCurrentPassword });
        }

        if (!newPassword || !confirmPassword || typeof newPassword !== 'string' || typeof confirmPassword !== 'string') {
            return res.status(400).json({ error: LOCALE.newPasswordRequired });
        }

        const currentUser = await User.findById(req.userId);

        if (!currentUser) {
            return res.status(404).json({ error: LOCALE.userNotFound });
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, currentUser.password);

        if (!isPasswordValid) {
            return res.status(400).json({ error: LOCALE.wrongCurrentPassword });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: LOCALE.passwordsNotMatching });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await User.findByIdAndUpdate(req.userId, { password: hashedPassword });

        res.status(200).json({ message: LOCALE.passwordSuccessfullyUpdated });
    } catch (error) {
        console.error('Error updating the current user\'s password:', error);
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

/**
 * Logs out the current user by clearing the JWT cookie
 * @param {Object} req The request object
 * @param {Object} res The response object to send a success message or an error response
 * @returns {Object} Returns a success message if logout is successful, otherwise returns an error response
 */
const logoutUser = (req, res) => {
    try {
        res.clearCookie('jwt');
        res.status(200).json({ message: LOCALE.nowDisconnected });
    } catch (error) {
        console.error('Error logging out the user:', error);
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

/**
 * Deletes the current user's account
 * @param {Object} req The request object containing the userId in req.userId
 * @param {Object} res The response object to send a success message or an error response
 * @returns {Object} Returns a success message if deletion is successful, otherwise returns an error response
 */
const deleteCurrentUser = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);

        if (user.ibanAttachment) {
            const bucketName = 'user-ibans';
            const fileName = user.ibanAttachment;

            try {
                await minioClient.removeObject(bucketName, fileName);
            } catch (deleteError) {
                console.error('Error deleting IBAN attachment from S3:', deleteError);
                res.status(500).json({ error: LOCALE.internalServerError });
            }
        }

        await User.findByIdAndDelete(userId);

        res.status(200).json({ message: LOCALE.accountSuccessfullyDeleted });
    } catch (error) {
        console.error('Error deleting the current user:', error);
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

/**
 * Retrieves a user's details by their ID
 * @param {Object} req The request object containing the userId in req.params.id
 * @param {Object} res The response object to send the user's pseudonym or an error response
 * @returns {Object} Returns the user's pseudonym if found, otherwise returns an error response
 */
const getUserById = async (req, res) => {
    const userId = req.params.id;
    const currentUserId = req.userId;

    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: LOCALE.userNotFound });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: LOCALE.userNotFound });
        }

        const groupMembershipsCurrentUser = await GroupMembership.find({ user_id: currentUserId, has_accepted_invitation: true });
        const groupIdsCurrentUser = groupMembershipsCurrentUser.map(membership => membership.group_id.toString());

        const groupMembershipsRequestedUser = await GroupMembership.find({ user_id: userId, has_accepted_invitation: true });
        const groupIdsRequestedUser = groupMembershipsRequestedUser.map(membership => membership.group_id.toString());

        const commonGroupIds = groupIdsCurrentUser.filter(groupId => groupIdsRequestedUser.includes(groupId));

        if (commonGroupIds.length === 0) {
            return res.status(403).json({ error: LOCALE.notAllowedToAccessUserDetails });
        }

        const userData = {
            pseudonym: user.pseudonym
        };

        if (user.firstname) {
            userData.firstname = user.firstname;
        }

        if (user.lastname) {
            userData.lastname = user.lastname;
        }

        if (user.iban) {
            userData.iban = user.iban;
        }

        if (user.ibanAttachment) {
            const bucketName = 'user-ibans';
            const fileName = user.ibanAttachment;

            const dataChunks = [];
            const dataStream = await minioClient.getObject(bucketName, fileName);

            dataStream.on('data', function (chunk) {
                dataChunks.push(chunk);
            });

            dataStream.on('end', function () {
                const concatenatedBuffer = Buffer.concat(dataChunks);
                const base64Data = concatenatedBuffer.toString('base64');

                userData.ibanAttachment = {
                    fileName,
                    content: base64Data
                };

                res.status(200).json(userData);
            });

            dataStream.on('error', function (err) {
                console.error('Error fetching the user IBAN attachment:', err);
                res.status(500).json({ error: LOCALE.internalServerError });
            });
        } else {
            res.status(200).json(userData);
        }
    } catch (error) {
        console.error('Error fetching the user:', error);
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

/**
 * Handles the forgot password process by sending a verification code to the user's email
 * @param {Object} req The request object containing the user's email in req.body.email
 * @param {Object} res The response object to send a success message or an error response
 * @returns {Object} Returns a success message if the verification code is sent successfully, otherwise returns an error response
 */
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (user && user.isGoogle) {
            return res.status(403).json({ error: LOCALE.googleUserCannotResetPassword });
        }

        const existingEntry = await ForgotPassword.findOne({ email });

        if (existingEntry) {
            await ForgotPassword.findOneAndDelete({ email });
        }

        if (!user) {
            return res.status(404).json({ error: LOCALE.emailDoesNotBelongToUser });
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000); // 6-digit code

        const forgotPasswordEntry = new ForgotPassword({
            email: email,
            code: verificationCode
        });
        await forgotPasswordEntry.save();

        const subject = LOCALE.passwordResetVerificationCode;
        const text = `${LOCALE.yourVerificationCodeIs} ${verificationCode}`;
        const emailSent = sendEmail(email, subject, text);

        if (emailSent) {
            return res.status(200).json({ message: LOCALE.verificationCodeSentSuccessfully });
        } else {
            console.error('Error sending the verification code by email:', error);
            return res.status(500).json({ error: LOCALE.internalServerError });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

/**
 * Resets the password of a user using a verification code
 * @param {Object} req The request object containing the user's email, verification code, new password, and confirm new password in req.body
 * @param {Object} res The response object to send a success message or an error response
 * @returns {Object} Returns a success message if the password reset is successful, otherwise returns an error response
 */
const resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword, confirmNewPassword } = req.body;
        const forgotPasswordEntry = await ForgotPassword.findOne({ email, code });

        if (!forgotPasswordEntry) {
            return res.status(404).json({ error: LOCALE.invalidVerificationCodeOrEmail });
        }

        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        if (forgotPasswordEntry.createdAt < tenMinutesAgo) {
            return res.status(400).json({ error: LOCALE.resetCodeExpired });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ error: LOCALE.passwordsNotMatching });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: LOCALE.userNotFound });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        await ForgotPassword.findOneAndDelete({ email, code });

        res.status(200).json({ message: LOCALE.passwordSuccessfullyUpdated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

module.exports = { registerUser, authenticateUser, getUsersList, getCurrentUser, updateCurrentUser, updateCurrentUserPassword, logoutUser, deleteCurrentUser, getUserById, authenticateUserWithGoogle, forgotPassword, resetPassword };

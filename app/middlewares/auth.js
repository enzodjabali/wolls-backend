const jwt = require("jsonwebtoken");
const LOCALE = require('../locales/fr-FR');

/**
 * Middleware function to authenticate JSON Web Tokens (JWT) in request headers
 * @param {Object} req The request object containing the JWT token in the 'Authorization' header
 * @param {Object} res The response object to send back error messages if authentication fails
 * @param {Function} next The next middleware function to call if authentication succeeds
 */
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ error: LOCALE.notConnected });
    }

    try {
        const decoded = jwt.verify(token, 'secret_key');
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ error: LOCALE.notConnected });
    }
};

module.exports = authenticateJWT;

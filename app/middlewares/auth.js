const jwt = require("jsonwebtoken");
const LOCALE = require('../locales/fr-FR');

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

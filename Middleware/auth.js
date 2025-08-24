const jwt = require('jsonwebtoken');
const createError = require('http-errors');

exports.auth = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(createError(401, 'Access denied. No token provided.'));
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        req.user = {
            id: decoded.userId,
            email: decoded.email,
            isAdmin: decoded.isAdmin
        };

        next();
    } catch (error) {
        return next(createError(403, 'Invalid token.'));
    }
};

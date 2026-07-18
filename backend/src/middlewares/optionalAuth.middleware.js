// src/middlewares/optionalAuth.middleware.js

const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {

    const token = req.cookies.token;

    // No hay sesión
    // pero seguimos porque la web es pública
    if (!token) {

        req.user = null;

        return next();

    }

    try {

        req.user = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

    } catch(error) {

        req.user = null;

    }

    next();

};
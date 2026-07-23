// src/middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "No autenticado" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    // Modo configuración enviado desde el frontend
    req.user.configMode = req.headers["x-config-mode"] === "true";
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
};

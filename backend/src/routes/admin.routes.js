// src/routes/admin.routes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
// Importamos el middleware que valida la propiedad "is_config"
const configPermission = require("../middlewares/role.middleware"); 
const adminController = require("../controllers/admin.controller");

// LOGIN (pública: cualquiera puede ver el formulario de entrada)
router.get("/login", adminController.loginPage);

// ADMIN (protegida 🔐)
// Primero verifica que tenga sesión activa (authMiddleware)
// Segundo verifica que tenga is_config en true (configPermission)
router.get("/admin", authMiddleware, configPermission(), adminController.adminPage);

// TECNIC (protegida 🔐)
// Lo mismo para la página técnica si requiere permisos de configuración
router.get("/tecnic", authMiddleware, configPermission(), adminController.tecniPage);

module.exports = router;

// const express = require("express");
// const router = express.Router();
// const authMiddleware = require("../middlewares/auth.middleware");
// const adminController = require("../controllers/admin.controller");

// // LOGIN (pública)
// router.get("/login", adminController.loginPage);

// // ADMIN (protegida 🔐)
// router.get("/admin", authMiddleware, adminController.adminPage);
// router.get("/tecnic", authMiddleware, adminController.tecniPage);

// module.exports = router;

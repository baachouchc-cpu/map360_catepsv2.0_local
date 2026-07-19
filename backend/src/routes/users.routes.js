//src/routes/users.routes.js

const express = require("express");
const router = express.Router();
const UsersController = require("../controllers/users.controller");
const authMiddleware = require("../middlewares/authMiddleware");

// ======================================
// LISTAR USUARIOS
// ======================================
router.get(
    "/",
    authMiddleware,
    UsersController.getUsers
);

// ======================================
// DATOS PARA FORMULARIO
// ======================================

// Roles
router.get(
    "/data/roles",
    authMiddleware,
    UsersController.getRoles
);

// Escenas disponibles
router.get(
    "/data/scenes",
    authMiddleware,
    UsersController.getScenes
);

// ======================================
// OBTENER USUARIO POR ID
// ======================================
router.get(
    "/:id",
    authMiddleware,
    UsersController.getUserById
);

 // ======================================
 // CREAR USUARIO
 // ======================================
router.post(
    "/",
    authMiddleware,
    UsersController.createUser
);

 // ======================================
 // ACTUALIZAR USUARIO
 // ======================================
router.put(
    "/:id",
    authMiddleware,
    UsersController.updateUser
);

 // ======================================
 // CAMBIAR ESTADO
 // ======================================
router.put(
    "/:id/status",
    authMiddleware,
    UsersController.updateUserStatus
);

 // ======================================
 // CAMBIAR ESTADO
 // ======================================
router.put(
    "/:id/config",
    authMiddleware,
    UsersController.updateUserConfig
);

module.exports = router;
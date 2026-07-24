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

// Roles
router.get(
    "/data/permisos",
    authMiddleware,
    UsersController.getPermisos
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
    "/:id(\\d+)",
    authMiddleware,
    UsersController.getUserById
);

 // ======================================
 // CREAR USUARIO
 // ======================================
router.post(
    "/",
    authMiddleware,
    UsersController.upsertUser
);

 // ======================================
 // ACTUALIZAR USUARIO
 // ======================================
router.put(
    "/:id(\\d+)",
    authMiddleware,
    UsersController.upsertUser
);

 // ======================================
 // CAMBIAR ESTADO
 // ======================================
router.put(
    "/:id/status",
    authMiddleware,
    UsersController.updateUserStatus
);

module.exports = router;
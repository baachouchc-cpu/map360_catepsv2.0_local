// src/routes/interactions.routes.js
const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();
const {
  upsertInteraction,
  getInteractionById,
  updateInteractionDescription,
  validateInteractionPassword,
  getNameTypes,
  getNameIcon,
  getAllInteractions,
  getActiveInteractions,
  updateInteractionStatus,
  updateInteractionPublic
} = require("../controllers/interactions.controller");

// POST → crear
router.post("/", upsertInteraction);

// GET → obtener todas las interacciones
router.get("/",authMiddleware, getAllInteractions);

// GET → obtener solo id y name de los tipos de interacción
router.get("/types", getNameTypes);

// GET → obtener solo id y name de los iconos
router.get("/icons", getNameIcon);

// GET → obtener 1 interacción
router.get("/:id(\\d+)", authMiddleware,getInteractionById);

// PUT → actualizar descripción
//router.put("/:id/description", updateInteractionDescription);
router.put("/:id(\\d+)/description", (req, res) => {
  req.body.id_interactions = req.params.id;
  updateInteractionDescription(req, res);
});

// POST → validar contraseña
router.post("/:id(\\d+)/pass_word", validateInteractionPassword);

// PUT → actualizar
router.put("/:id(\\d+)", (req, res) => {
  req.body.id_interactions = req.params.id;
  upsertInteraction(req, res);
});

// GET → obtener solo escenas activas
router.get("/active", getActiveInteractions);

router.put("/:id/status",updateInteractionStatus);

router.put("/:id/public",updateInteractionPublic);

module.exports = router;
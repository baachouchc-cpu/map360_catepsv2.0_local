// src/routes/hotspots.routes.js
const express = require('express');
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();
const {
  upsertHotspot,
  getHotspots,
  getActiveHotspots,
  getHotspotsByScene,
  getHotspotById,
  updateHotspotStatus,
  updateHotspotPublic
} = require("../controllers/hotspots.controller");

// POST → crear
router.post("/", upsertHotspot);

// PUT → actualizar
router.put("/:id(\\d+)", (req, res) => {
  req.body.id_hotspots = req.params.id;
  upsertHotspot(req, res);
});

// Obtener todos
router.get("/",authMiddleware, getHotspots);

// Obtener activos
router.get("/active", getActiveHotspots);

// Obtener por escena
router.get("/scene/:scene_id",authMiddleware, getHotspotsByScene);

// Obtener por ID
//router.get("/:id", getHotspotById);
router.get("/:id", authMiddleware,getHotspotById);

// Actualizar estado
router.put("/:id/status",updateHotspotStatus);

// Actualizar público
router.put("/:id/public",updateHotspotPublic);

module.exports = router;
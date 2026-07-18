// src/routes/hotspots.routes.js
const express = require('express');
const router = express.Router();
const {
  upsertHotspot,
  getHotspots,
  getActiveHotspots,
  getHotspotsByScene,
  getHotspotById,
  updateHotspotStatus
} = require("../controllers/hotspots.controller");

// POST → crear
router.post("/", upsertHotspot);

// PUT → actualizar
router.put("/:id(\\d+)", (req, res) => {
  req.body.id_hotspots = req.params.id;
  upsertHotspot(req, res);
});

// Obtener todos
router.get("/", getHotspots);

// Obtener activos
router.get("/active", getActiveHotspots);

// Obtener por escena
router.get("/scene/:scene_id", getHotspotsByScene);

// Obtener por ID
router.get("/:id", getHotspotById);

// Actualizar estado
router.put("/:id/status",updateHotspotStatus);

module.exports = router;
const express = require('express');
const router = express.Router();
const { upsertScene,
    getScenes,
    getNameScenes,
    getNameKinds,
    getNameFloors,
    getNameTowers,
    getNameOrientations,
    getSceneById, 
    getActiveScenes,
    updateSceneStatus,
    updateScenePublicStatus } = require('../controllers/scenes.controller');

// POST → crear o actualizar una escena
router.post('/', upsertScene);

// PUT → actualizar
router.put("/:id(\\d+)", (req, res) => {
  req.body.id_scene = req.params.id;
  upsertScene(req, res);
});

// GET → obtener todas las escenas con hotspots
router.get('/', getScenes);

// GET → obtener solo id y name de las escenas
router.get('/names', getNameScenes);

// GET → obtener solo id y name de los tipos
router.get('/kinds', getNameKinds);

// GET → obtener solo id y name de los pisos
router.get('/floors', getNameFloors);

// GET → obtener solo id y name de las torres
router.get('/towers', getNameTowers);

// GET → obtener solo id y name de las orientaciones
router.get('/orientations', getNameOrientations);

// GET → obtener 1 escena por id
router.get('/:id(\\d+)', getSceneById);

// GET → obtener solo escenas activas
router.get("/active", getActiveScenes);

router.put("/:id/status",updateSceneStatus);

router.put("/:id/public",updateScenePublicStatus);

module.exports = router;

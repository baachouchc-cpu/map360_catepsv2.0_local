const Scenes = require('../models/scenes.model');
const db = require("../services/db");

// CREATE + UPDATE (UPSERT)
const upsertScene = async (req, res) => {
  try {
    const {
      imagen_url,
      imagen_id,
      kind_id,
      floor_id,
      tower_id,
      orientation_id,
      description,
    } = req.body;

    // Validación mínima
    if (
      !imagen_url ||
      imagen_id === undefined ||
      !kind_id ||
      !floor_id ||
      !tower_id ||
      !orientation_id ||
      !description
    ) {
      return res.status(400).json({
        error: "Faltan campos obligatorios"
      });
    }

    const scene = await Scenes.upsert(req.body);

    res.status(200).json({
      message: "Escena creada o actualizada correctamente",
      scene
    });

  } catch (error) {
    console.error("UPSERT scene error:", error);
    res.status(500).json({
      error: "Error interno del servidor"
    });
  }
};

// Controlador para obtener todas las escenas con sus hotspots
// async function getScenes(req, res) {

//     try {

//         const scenes =
//             await Scenes.getAllScenesWithHotspots({
//                 isActive:true,
//                 user:req.user || null
//             });

//         res.json(scenes);

//     } catch (err) {

//         console.error(err);

//         res.status(500).json({
//             message:'Error retrieving scenes'
//         });

//     }
// }

async function getScenes(req,res){

    try{

        const scenes =
            await Scenes.getAllScenesWithHotspots({

                user:req.user || null,

                configMode:
                    req.query.configMode === "true"

            });

        res.json(scenes);

    }
    catch(err){

        console.error(err);

        res.status(500).json({

            message:"Error retrieving scenes"

        });

    }

}
// Controlador para obtener solo id y name de las escenas
const getNameScenes = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id_scene, description AS name FROM scenes ORDER BY name"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo escenas" });
  }
};

// Controlador para obtener solo id y tipo de las escenas
const getNameKinds = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id_kind, name_kind FROM kind ORDER BY name_kind"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo tipos de escena" });
  }
};

// Controlador para obtener solo id y piso de las escenas
const getNameFloors = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id_floor, name_floor FROM floor ORDER BY name_floor"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo pisos" });
  }
};

// Controlador para obtener solo id y torre de las escenas
const getNameTowers = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id_tower, name_tower FROM tower ORDER BY name_tower"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo torres" });
  }
};

// Controlador para obtener solo id y orientación de las escenas
const getNameOrientations = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id_orientation, name_orientation FROM orientation ORDER BY name_orientation"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo orientaciones" });
  }
};

// GET BY ID
const getSceneById = async (req,res)=>{

    try {

        const { id } = req.params;

        const scene = await Scenes.getSceneById(
            id,
            req.user
        );


        if(!scene){

            return res.status(404).json({
                error:"Escena no encontrada"
            });

        }


        res.json(scene);


    } catch(error){

        console.error("GET scene error:",error);

        res.status(500).json({
            error:"Error interno del servidor"
        });

    }

};

async function getActiveScenes(req, res) {
    try {

        const scenes = await Scenes.getAllScenesWithHotspots({
            isActive:true,
            user:req.user || null
        });

        res.json(scenes);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Error retrieving active scenes"
        });

    }
}

async function updateSceneStatus(req, res) {

    try {

        const { id } = req.params;
        const { is_active } = req.body;

        if (typeof is_active !== "boolean") {
            return res.status(400).json({
                message: "El campo is_active es obligatorio."
            });
        }

        const { rows } = await db.query(
            `
            UPDATE scenes
            SET
                is_active = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id_scene = $2
            RETURNING *;
            `,
            [is_active, id]
        );

        if (!rows.length) {
            return res.status(404).json({
                message: "Escena no encontrada."
            });
        }

        res.json(rows[0]);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Error actualizando el estado de la escena."
        });

    }

}

async function updateScenePublicStatus(req, res) {

    try {

        const { id } = req.params;
        const { is_public } = req.body;

        if (typeof is_public !== "boolean") {
            return res.status(400).json({
                message: "El campo is_public es obligatorio."
            });
        }

        const { rows } = await db.query(
            `
            UPDATE scenes
            SET
                is_public = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id_scene = $2
            RETURNING *;
            `,
            [is_public, id]
        );

        if (!rows.length) {
            return res.status(404).json({
                message: "Escena no encontrada."
            });
        }

        res.json(rows[0]);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Error actualizando el estado de la escena."
        });

    }

}

module.exports = { upsertScene, getScenes, getNameScenes, getNameKinds, getNameFloors, 
  getNameTowers, getNameOrientations, getSceneById, getActiveScenes, updateSceneStatus, updateScenePublicStatus};
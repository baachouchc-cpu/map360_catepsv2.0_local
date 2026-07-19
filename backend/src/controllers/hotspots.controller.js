// src/controllers/hotspots.controller.js

const Hotspots = require('../models/hotspots.models');
const db = require("../services/db");


// =========================================
// CREATE + UPDATE (UPSERT)
// =========================================

const upsertHotspot = async (req, res) => {

    try {

        const {

            scene_id,
            title,
            yaw,
            pitch,
            description,
            link_scene_id,
            icon_id,
            rotation

        } = req.body;


        // Validación mínima

        if (

            !scene_id ||
            !title ||
            yaw === undefined ||
            pitch === undefined ||
            !link_scene_id ||
            !icon_id

        ) {

            return res.status(400).json({

                error: "Faltan campos obligatorios"

            });

        }


        const hotspot =
            await Hotspots.upsert(req.body);


        res.status(200).json({

            message:
                "Hotspot creado o actualizado correctamente",

            hotspot

        });


    } catch (error) {

        console.error(
            "UPSERT hotspot error:",
            error
        );


        res.status(500).json({

            error:
                "Error interno del servidor"

        });

    }

};


// =========================================
// OBTENER TODOS LOS HOTSPOTS
// =========================================

const getHotspots = async (req, res) => {

    try {
        
        const hotspots = await Hotspots.getAllHotspots(req.user);

        res.json(hotspots);

    } catch (error) {

        console.error(
            "GET hotspots error:",
            error
        );

        res.status(500).json({

            message:
                "Error obteniendo hotspots"

        });

    }

};


// =========================================
// OBTENER HOTSPOTS ACTIVOS
// =========================================

const getActiveHotspots = async (req, res) => {

    try {

        const hotspots =
            await Hotspots.getAllHotspots(true);


        res.json(hotspots);


    } catch (error) {

        console.error(
            "GET active hotspots error:",
            error
        );


        res.status(500).json({

            message:
                "Error obteniendo hotspots activos"

        });

    }

};


// =========================================
// OBTENER HOTSPOTS DE UNA ESCENA
// =========================================

const getHotspotsByScene = async (req, res) => {

    try {

        const {
            scene_id
        } = req.params;


        const hotspots = await Hotspots.getByScene(
            scene_id,
            req.user
        );


        res.json(hotspots);


    } catch (error) {

        console.error(
            "GET hotspots by scene error:",
            error
        );


        res.status(500).json({

            message:
                "Error obteniendo hotspots de la escena"

        });

    }

};


// =========================================
// OBTENER HOTSPOT POR ID
// =========================================

const getHotspotById = async (req,res)=>{

    try {

        const { id } = req.params;

        const hotspots = await Hotspots.getHotspotById(
            id,
            req.user
        );

        if(!hotspots){

            return res.status(404).json({
                error:"Hotspot no encontrado"
            });

        }

        res.json(hotspots);

    } catch(error){

        console.error("GET hotspots error:",error);

        res.status(500).json({
            error:"Error interno del servidor"
        });

    }

};


// =========================================
// ACTUALIZAR ESTADO
// =========================================

const updateHotspotStatus = async (req, res) => {

    try {

        const {id} = req.params;
        const {is_active} = req.body;


        if (typeof is_active !== "boolean") {
            return res.status(400).json({
                message:
                    "El campo is_active es obligatorio."
            });
        }


        const {rows} = await db.query(
            `
            UPDATE hotspots
            SET
                is_active = $1,
                updated_at =
                    CURRENT_TIMESTAMP
            WHERE id_hotspots = $2
            RETURNING *;
            `,
            [is_active, id]

        );


        if (!rows.length) {
            return res.status(404).json({
                message:
                    "Hotspot no encontrado."
            });
        }

        res.json(rows[0]);


    } catch (error) {

        console.error(
            "UPDATE hotspot status error:",
            error
        );


        res.status(500).json({

            message:
                "Error actualizando el estado del hotspot."

        });

    }

};

const updateHotspotPublic = async (req, res) => {

    try {

        const {id} = req.params;
        const {is_public} = req.body;


        if (typeof is_public !== "boolean") {
            return res.status(400).json({
                message:
                    "El campo is_public es obligatorio."
            });
        }


        const {rows} = await db.query(
            `
            UPDATE hotspots
            SET
                is_public = $1,
                updated_at =
                    CURRENT_TIMESTAMP
            WHERE id_hotspots = $2
            RETURNING *;
            `,
            [is_public, id]

        );


        if (!rows.length) {
            return res.status(404).json({
                message:
                    "Hotspot no encontrado."
            });
        }

        res.json(rows[0]);


    } catch (error) {

        console.error(
            "UPDATE hotspot status error:",
            error
        );


        res.status(500).json({

            message:
                "Error actualizando el estado del hotspot."

        });

    }

};



module.exports = {

    upsertHotspot,
    getHotspots,
    getActiveHotspots,
    getHotspotsByScene,
    getHotspotById,
    updateHotspotStatus,
    updateHotspotPublic
};
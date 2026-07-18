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

        const hotspots =
            await Hotspots.getAllHotspots();


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


        const hotspots =
            await Hotspots.getByScene(
                scene_id
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

const getHotspotById = async (req, res) => {

    try {

        const {
            id
        } = req.params;


        const {
            rows
        } = await db.query(

            `

            SELECT

                h.id_hotspots,
                h.scene_id,
                h.title,
                h.yaw,
                h.pitch,
                h.description,
                h.link_scene_id,
                h.icon_id,
                h.rotation,
                h.is_active,
                h.updated_at,

                -- Escena origen
                s.description AS scene_name,
                s.imagen_id AS scene_image_id,

                img_scene.nombre_img
                    AS scene_image_name,

                img_scene.url_minio
                    AS scene_image_url,

                -- Escena destino
                ls.description
                    AS link_scene_name,

                ls.imagen_id
                    AS link_scene_image_id,

                img_link.nombre_img
                    AS link_scene_image_name,

                img_link.url_minio
                    AS link_scene_image_url,

                -- Icono
                i.name_icon
                    AS icon_name,

                i.icon_url
                    AS icon_url

            FROM hotspots h

            LEFT JOIN scenes s
                ON s.id_scene = h.scene_id

            LEFT JOIN imagenes img_scene
                ON img_scene.id_imagen = s.imagen_id

            LEFT JOIN scenes ls
                ON ls.id_scene = h.link_scene_id

            LEFT JOIN imagenes img_link
                ON img_link.id_imagen = ls.imagen_id

            LEFT JOIN icons i
                ON i.id_icon = h.icon_id

            WHERE h.id_hotspots = $1

            `,

            [id]

        );


        if (!rows.length) {

            return res.status(404).json({

                error:
                    "Hotspot no encontrado"

            });

        }


        res.json(rows[0]);


    } catch (error) {

        console.error(
            "GET hotspot error:",
            error
        );


        res.status(500).json({

            error:
                "Error interno del servidor"

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


module.exports = {

    upsertHotspot,
    getHotspots,
    getActiveHotspots,
    getHotspotsByScene,
    getHotspotById,
    updateHotspotStatus

};
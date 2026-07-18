// src/models/hotspots.model.js

const pool = require("../services/db");

const Hotspots = {

    //Todas las navegaciones

    getAllHotspots: async ({isActive = null, isPublic = null}={}) => {

        let query = `

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
                h.is_public,

                -- Escena origen
                s.description AS scene_name,
                s.imagen_id AS scene_image_id,
                img_scene.nombre_img AS from_scene_name,
                img_scene.url_minio AS from_scene__url,

                -- Escena destino
                ls.description AS link_scene_name,
                ls.imagen_id AS link_scene_image_id,
                img_link.nombre_img AS to_scene_name,
                img_link.url_minio AS to_scene_url

                -- Icono
                -- i.nombre_img AS icon_name,
                -- i.url_minio AS icon_url,
                -- i.tipo AS icon_type

            FROM hotspots h

            LEFT JOIN scenes s
                ON s.id_scene = h.scene_id
            
            LEFT JOIN imagenes img_scene
                ON img_scene.id_imagen = s.imagen_id

            LEFT JOIN scenes ls
                ON ls.id_scene = h.link_scene_id
            
            LEFT JOIN imagenes img_link
                ON img_link.id_imagen = ls.imagen_id

            WHERE 1=1
        `;

        const values = [];
        let index = 1;

        if (isActive !== null) {

            query += `
                AND h.is_active = $${index}
            `;

            values.push(isActive);
            index++;

        }

        if(isPublic !== null){

            query += `
                AND s.is_public = $${index}
                AND ls.is_public = $${index}
            `;

            values.push(isPublic);
            index++;

        }

        query += `
            ORDER BY h.id_hotspots ASC;
        `;

        const { rows } = await pool.query(query, values);

        return rows;

    },


    //Navegaciones de una escena

    getByScene: async (sceneId, {isActive = true, isPublic = null}={}) => {

        const query = `

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
                h.is_public

                -- Escena origen
                s.description AS scene_name,
                s.imagen_id AS scene_image_id,
                img_scene.nombre_img AS from_scene_name,
                img_scene.url_minio AS from_scene_url,

                -- Escena destino
                ls.description AS link_scene_name,
                ls.imagen_id AS link_scene_image_id,
                img_link.nombre_img AS to_scene_name,
                img_link.url_minio AS to_scene_url

                -- Icono
                -- i.nombre_img AS icon_name,
                -- i.url_minio AS icon_url,
                -- i.tipo AS icon_type

            FROM hotspots h

            LEFT JOIN scenes s
                ON s.id_scene = h.scene_id
            
            LEFT JOIN imagenes img_scene
                ON img_scene.id_imagen = s.imagen_id


            LEFT JOIN scenes ls
                ON ls.id_scene = h.link_scene_id
            
            LEFT JOIN imagenes img_link
                ON img_link.id_imagen = ls.imagen_id

            WHERE h.scene_id = $1
            AND h.is_active = $2

            ORDER BY h.id_hotspots ASC;

        `;

        const values = [
            sceneId,
            isActive
        ];

        const { rows } = await pool.query(query, values);

        return rows;

    },


    //Insertar / actualizar

    upsert: async (data) => {

        const {

            id_hotspots,
            scene_id,
            title,
            yaw,
            pitch,
            description,
            link_scene_id,
            icon_id,
            rotation

        } = data;


        /*
        =====================================
        EDITAR HOTSPOT
        =====================================
        */

        if (id_hotspots) {

            const query = `

                INSERT INTO hotspots (

                    id_hotspots,
                    scene_id,
                    title,
                    yaw,
                    pitch,
                    description,
                    link_scene_id,
                    icon_id,
                    rotation

                )

                VALUES (

                    $1,$2,$3,$4,$5,$6,$7,$8,$9

                )

                ON CONFLICT (id_hotspots)

                DO UPDATE SET

                    scene_id      = EXCLUDED.scene_id,
                    title         = EXCLUDED.title,
                    yaw           = EXCLUDED.yaw,
                    pitch         = EXCLUDED.pitch,
                    description   = EXCLUDED.description,
                    link_scene_id = EXCLUDED.link_scene_id,
                    icon_id       = EXCLUDED.icon_id,
                    rotation      = EXCLUDED.rotation,
                    is_active     = TRUE,
                    updated_at    = CURRENT_TIMESTAMP

                RETURNING *;

            `;

            const values = [

                id_hotspots,
                scene_id,
                title,
                yaw,
                pitch,
                description || null,
                link_scene_id,
                icon_id,
                rotation ?? 0

            ];

            const { rows } =
                await pool.query(query, values);

            return rows[0];

        }


        /*
        =====================================
        CREAR HOTSPOT
        =====================================
        */

        const insertQuery = `

            INSERT INTO hotspots (

                scene_id,
                title,
                yaw,
                pitch,
                description,
                link_scene_id,
                icon_id,
                rotation

            )

            VALUES (

                $1,$2,$3,$4,$5,$6,$7,$8

            )

            RETURNING *;

        `;

        const insertValues = [

            scene_id,
            title,
            yaw,
            pitch,
            description || null,
            link_scene_id,
            icon_id,
            rotation ?? 0

        ];

        const { rows } =
            await pool.query(
                insertQuery,
                insertValues
            );

        return rows[0];

    }

};


module.exports = Hotspots;

// // src/models/hotspots.models.js
// const pool = require("../services/db");

// const Hotspots = {
//   getAllDirectional: async () => {
//     const query = `
//       SELECT h.id_hotspots, h.scene_id, h.link_scene_id, h.title, h.icon_id,
//              s1.tower_id AS from_tower, s1.floor_id AS from_floor, s1.orientation_id AS from_orientation,
//              s2.tower_id AS to_tower, s2.floor_id AS to_floor, s2.orientation_id AS to_orientation
//       FROM public.hotspots h
//       JOIN public.scenes s1 ON s1.id_scene = h.scene_id
//       JOIN public.scenes s2 ON s2.id_scene = h.link_scene_id
//       WHERE h.icon_id = 2;
//     `;
//     const { rows } = await pool.query(query);
//     return rows;
//   }
// };

// module.exports = Hotspots;

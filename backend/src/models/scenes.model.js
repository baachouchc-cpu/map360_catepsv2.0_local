
// src/models/scene.model.js

const pool = require("../services/db");

const Scenes = {

//  getAllScenesWithHotspots: async ({isActive = null, isPublic = null, user}={}) => {
    
//     const values = [];
//     let index = 1;
//     let hotspotCondition = "";
//     let interactionCondition = "";

//     // CONTROL DE INTERACCIONES
    
//     if (!user) {

//         interactionCondition = `
//             WHERE r.is_active = true
//             AND r.is_public = true
//         `;

//     }else if (user.role === 1) {

//         interactionCondition = `
//             WHERE 1=1
//         `;

//     }else {

//         interactionCondition = `
//             WHERE r.is_active = true
//         `;

//     }

//     // CONTROL DE HOSTPOTS
    
//     if (!user) {

//         hotspotCondition = `
//             WHERE h.is_active = true
//             AND h.is_public = true
//             AND destination_scene.is_active = true
//             AND destination_scene.is_public = true
//         `;

//     }else if (user.role === 1) {

//         hotspotCondition = `
//             WHERE 1=1
//         `;

//     }else if (user.role === 2) {
//         // Solo activas
//         hotspotCondition = `
//             WHERE h.is_active = true
//             AND destination_scene.is_active = true
//         `;

//     }else {

//         hotspotCondition = `
//             WHERE
//                 h.is_active = true

//                 AND destination_scene.is_active = true

//                 AND (

//                     destination_scene.is_public = true

//                     OR EXISTS (

//                         SELECT 1

//                         FROM permiso_x_escena px

//                         WHERE px.scene_id = destination_scene.id_scene

//                         AND px.permisox_id = $${index}

//                     )

//                 )
//         `;

//         values.push(user.idPermiso);
//         index++;

//     }

//     let query = `
//     SELECT 
//     s.id_scene,
//     s.imagen_url,
//     s.imagen_id,

//     img.nombre_img,
//     img.url_minio,
//     img.tipo,

//     s.is_active,
//     s.is_public,
//     s.updated_at,

//     s.description AS scene_description,

//     -- 🔹 Kind
//     s.kind_id,
//     k.name_kind,

//     -- 🔹 Floor
//     s.floor_id,
//     f.name_floor,

//     -- 🔹 Tower
//     s.tower_id,
//     t.name_tower,

//     -- 🔹 Orientation
//     s.orientation_id,
//     o.name_orientation,

//     h.hotspots,
//     r.interactions

//   FROM scenes s

//   LEFT JOIN imagenes img ON img.id_imagen = s.imagen_id
//   LEFT JOIN kind k ON s.kind_id = k.id_kind
//   LEFT JOIN floor f ON s.floor_id = f.id_floor
//   LEFT JOIN tower t ON s.tower_id = t.id_tower
//   LEFT JOIN orientation o ON s.orientation_id = o.id_orientation

//   -- Subquery para hotspots
//   LEFT JOIN (
//       SELECT h.scene_id,
//             json_agg(
//               json_build_object(
//                 'id_hotspots', h.id_hotspots,
//                 'title', h.title,
//                 'yaw', h.yaw,
//                 'pitch', h.pitch,
//                 'description', h.description,
//                 'link_scene_id', h.link_scene_id,
//                 'icon_id', h.icon_id,
//                 'icon_url', i.icon_url,
//                 'name_icon', i.name_icon,
//                 'rotation', h.rotation,
//                 'h_is_active', h.is_active,
//                 'h_is_public', h.is_public,
//                 'h_link_scene_active', destination_scene.is_active,
//                 'h_link_scene_public', destination_scene.is_public
//               )
//             ) AS hotspots

//       FROM hotspots h

//       LEFT JOIN icons i ON h.icon_id = i.id_icon
//       INNER JOIN scenes destination_scene ON destination_scene.id_scene = h.link_scene_id
//       ${hotspotCondition}
//       GROUP BY h.scene_id

//   ) h ON s.id_scene = h.scene_id

//   -- Subquery para interactions
//   LEFT JOIN (
//       SELECT r.scene_id,
//             json_agg(
//               json_build_object(
//                 'id_interactions', r.id_interactions,
//                 'title', r.title,
//                 'yaw', r.yaw,
//                 'pitch', r.pitch,
//                 'description', r.description,
//                 'link', r.link,
//                 'icon_id', r.icon_id,
//                 'icon_url', rc.icon_url,
//                 'name_icon', rc.name_icon,
//                 'rotation', r.rotation,
//                 'radius', r.radius,
//                 'type', r.type_id,
//                 'type_name', c.name,
//                 'width_px', r.width_px,
//                 'height_px', r.height_px,
//                 'api_key', r.api_key,
//                 'update_api', r.update_api,
//                 'r_is_active', r.is_active,
//                 'r_is_public', r.is_public
//               )
//             ) AS interactions

//       FROM interactions r

//       LEFT JOIN itypes c ON c.id_type = r.type_id
//       LEFT JOIN icons rc ON r.icon_id = rc.id_icon
//       ${interactionCondition}
//       GROUP BY r.scene_id

//   ) r ON s.id_scene = r.scene_id

//   WHERE 1=1
//     `;

//    // CONTROL DE ACCESO

//     if (!user) {

//         query += `
//             AND s.is_active = true
//             AND s.is_public = true
//         `;

//     }else if (user.role === 1) {

//         // Sin filtros
//     }else if (user.role === 2) {
//         // Solo activas
//         query += `
//             AND s.is_active = true
//         `;
//     } else {

//         query += `
//             AND s.is_active = true

//             AND (

//                 s.is_public = true

//                 OR EXISTS (

//                     SELECT 1

//                     FROM permiso_x_escena px

//                     WHERE px.scene_id = s.id_scene

//                     AND px.permisox_id = $${index}

//                 )

//             )
//         `;

//         values.push(user.idPermiso);
//         index++;

//     }

//     query += `
//         ORDER BY s.id_scene ASC;
//     `;

//     const { rows } = await pool.query(query, values);

//     return rows;

//   },

    getAllScenesWithHotspots: async (
    {
        user = null,
        configMode = false
    } = {}
    ) => {

        const values = [];
        let index = 1;

        let hotspotCondition = "";
        let interactionCondition = "";
        let sceneCondition = "";

        /*=========================================
        =         MODO CONFIGURACIÓN             =
        =========================================*/

        if(configMode){

            // ADMIN
            if(user?.role === 1){

                hotspotCondition = `
                    WHERE 1=1
                `;

                interactionCondition = `
                    WHERE 1=1
                `;

                sceneCondition = `
                    1=1
                `;

            }

            // TÉCNICO
            else{

                hotspotCondition = `
                    WHERE
                        h.is_active = true
                    AND destination_scene.is_active = true
                `;

                interactionCondition = `
                    WHERE
                        r.is_active = true
                `;

                sceneCondition = `
                    s.is_active = true
                `;

            }

        }

        /*=========================================
        =          MODO NAVEGACIÓN               =
        =========================================*/

        else{

            // INVITADO
            if(!user){

                hotspotCondition = `
                    WHERE
                        h.is_active = true
                    AND h.is_public = true
                    AND destination_scene.is_active = true
                    AND destination_scene.is_public = true
                `;

                interactionCondition = `
                    WHERE
                        r.is_active = true
                    AND r.is_public = true
                `;

                sceneCondition = `
                    s.is_active = true
                    AND s.is_public = true
                `;

            }

            // USUARIO AUTENTICADO
            else{

                hotspotCondition = `
                    WHERE

                        h.is_active = true

                        AND destination_scene.is_active = true

                        AND (

                            destination_scene.is_public = true

                            OR EXISTS(

                                SELECT 1

                                FROM permiso_x_escena px

                                WHERE px.scene_id = destination_scene.id_scene

                                AND px.permisox_id = $${index}

                            )

                        )
                `;

                interactionCondition = `
                    WHERE
                        r.is_active = true
                `;

                sceneCondition = `
                    s.is_active = true

                    AND (

                        s.is_public = true

                        OR EXISTS(

                            SELECT 1

                            FROM permiso_x_escena px

                            WHERE px.scene_id = s.id_scene

                            AND px.permisox_id = $${index}

                        )

                    )
                `;

                values.push(user.permisos_id);
                index++;

            }

        }

        let query = `

        SELECT

            s.id_scene,
            s.imagen_url,
            s.imagen_id,

            img.nombre_img,
            img.url_minio,
            img.tipo,

            s.is_active,
            s.is_public,
            s.updated_at,

            s.description AS scene_description,

            s.kind_id,
            k.name_kind,

            s.floor_id,
            f.name_floor,

            s.tower_id,
            t.name_tower,

            s.orientation_id,
            o.name_orientation,

            h.hotspots,
            r.interactions

        FROM scenes s

        LEFT JOIN imagenes img
            ON img.id_imagen = s.imagen_id

        LEFT JOIN kind k
            ON k.id_kind = s.kind_id

        LEFT JOIN floor f
            ON f.id_floor = s.floor_id

        LEFT JOIN tower t
            ON t.id_tower = s.tower_id

        LEFT JOIN orientation o
            ON o.id_orientation = s.orientation_id

        LEFT JOIN(

            SELECT

                h.scene_id,

                json_agg(

                    json_build_object(

                        'id_hotspots',h.id_hotspots,
                        'title',h.title,
                        'yaw',h.yaw,
                        'pitch',h.pitch,
                        'description',h.description,
                        'link_scene_id',h.link_scene_id,
                        'icon_id',h.icon_id,
                        'icon_url',i.icon_url,
                        'name_icon',i.name_icon,
                        'rotation',h.rotation,
                        'h_is_active',h.is_active,
                        'h_is_public',h.is_public,
                        'h_link_scene_active',destination_scene.is_active,
                        'h_link_scene_public',destination_scene.is_public

                    )

                ) hotspots

            FROM hotspots h

            LEFT JOIN icons i
                ON i.id_icon=h.icon_id

            INNER JOIN scenes destination_scene
                ON destination_scene.id_scene=h.link_scene_id

            ${hotspotCondition}

            GROUP BY h.scene_id

        ) h

        ON h.scene_id=s.id_scene

        LEFT JOIN(

            SELECT

                r.scene_id,

                json_agg(

                    json_build_object(

                        'id_interactions',r.id_interactions,
                        'title',r.title,
                        'yaw',r.yaw,
                        'pitch',r.pitch,
                        'description',r.description,
                        'link',r.link,
                        'icon_id',r.icon_id,
                        'icon_url',rc.icon_url,
                        'name_icon',rc.name_icon,
                        'rotation',r.rotation,
                        'radius',r.radius,
                        'type',r.type_id,
                        'type_name',c.name,
                        'width_px',r.width_px,
                        'height_px',r.height_px,
                        'api_key',r.api_key,
                        'update_api',r.update_api,
                        'r_is_active',r.is_active,
                        'r_is_public',r.is_public

                    )

                ) interactions

            FROM interactions r

            LEFT JOIN itypes c
                ON c.id_type=r.type_id

            LEFT JOIN icons rc
                ON rc.id_icon=r.icon_id

            ${interactionCondition}

            GROUP BY r.scene_id

        ) r

        ON r.scene_id=s.id_scene

        WHERE

            ${sceneCondition}

        ORDER BY

            s.id_scene ASC;

        `;
        
        const { rows } = await pool.query(query, values);

        return rows;

    },

  upsert: async (data) => {

        const {

            id_scene,
            imagen_url,
            kind_id,
            floor_id,
            tower_id,
            orientation_id,
            description,
            imagen_id

        } = data;

        if (id_scene) {

            const query = `

                INSERT INTO scenes (

                    id_scene,
                    imagen_url,
                    kind_id,
                    floor_id,
                    tower_id,
                    orientation_id,
                    description,
                    imagen_id

                )

                VALUES (

                    $1,$2,$3,$4,$5,$6,$7,$8

                )

                ON CONFLICT (id_scene)

                DO UPDATE SET

                    imagen_url    = EXCLUDED.imagen_url,
                    kind_id       = EXCLUDED.kind_id,
                    floor_id      = EXCLUDED.floor_id,
                    tower_id      = EXCLUDED.tower_id,
                    orientation_id= EXCLUDED.orientation_id,
                    description   = EXCLUDED.description,
                    imagen_id     = EXCLUDED.imagen_id,
                    is_active     = TRUE,
                    updated_at     = CURRENT_TIMESTAMP

                RETURNING *;

            `;

            const values = [

                id_scene,
                imagen_url,
                kind_id,
                floor_id,
                tower_id,
                orientation_id,
                description,
                imagen_id || null

            ];

            const { rows } = await pool.query(query, values);

            return rows[0];

        }

        const insertQuery = `

            INSERT INTO scenes (

                imagen_url,
                kind_id,
                floor_id,
                tower_id,
                orientation_id,
                description,
                imagen_id

            )

            VALUES (

                $1,$2,$3,$4,$5,$6,$7

            )

            RETURNING *;

        `;

        const insertValues = [

            imagen_url,
            kind_id,
            floor_id,
            tower_id,
            orientation_id,
            description,
            imagen_id || null

        ];

        const { rows } = await pool.query(insertQuery, insertValues);

        return rows[0];

    },

    getSceneById: async (id, user) => {

        let query = `
            SELECT 
                s.*,

                k.name_kind AS scene_type,
                f.name_floor AS floor_name,
                t.name_tower AS tower_name,
                o.name_orientation AS orientation_name,

                i.nombre_img AS image_name,
                i.url_minio AS image_url_minio,
                i.tipo AS image_type

            FROM scenes s

            JOIN kind k 
                ON s.kind_id = k.id_kind

            JOIN floor f 
                ON s.floor_id = f.id_floor

            JOIN tower t 
                ON s.tower_id = t.id_tower

            JOIN orientation o 
                ON s.orientation_id = o.id_orientation

            LEFT JOIN imagenes i 
                ON s.imagen_id = i.id_imagen

            WHERE s.id_scene = $1
        `;


        const values = [id];

        // CONTROL PANEL

        if (!user || user.role !== 1) {

            query += `
                AND s.is_active = true
            `;

        }
        
        // Admin no añade filtro
        // puede editar activas e inactivas

        const { rows } = await pool.query(query, values);

        return rows[0] || null;

    },
};


module.exports = Scenes;

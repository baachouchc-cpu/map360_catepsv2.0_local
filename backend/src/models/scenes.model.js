
// src/models/scene.model.js

const pool = require("../services/db");

const Scenes = {

 getAllScenesWithHotspots: async ({isActive = null, isPublic = null, user}={}) => {
    const values = [];
    let index = 1;
    let hotspotCondition = "";
    let interactionCondition = "";

    // CONTROL DE INTERACCIONES
    
    if (!user) {

        interactionCondition = `
            WHERE r.is_active = true
            AND r.is_public = true
        `;


    } else if (user.role === 1) {

        interactionCondition = `
            WHERE 1=1
        `;


    // } else if (user.role === 2) {

    //     interactionCondition = `
    //         WHERE r.is_active = true
    //     `;


    } else {

        interactionCondition = `
            WHERE r.is_active = true
        `;

        // interactionCondition = `
        //     WHERE r.is_active = true
        //     AND r.is_public = true
        // `;

    }

    // CONTROL DE HOSTPOTS
    
    if (!user) {

        // sin login
        hotspotCondition = `
            WHERE h.is_active = true
            AND h.is_public = true
            AND destination_scene.is_active = true
            AND destination_scene.is_public = true
        `;


    } else if (user.role === 1) {

        // admin
        hotspotCondition = `
            WHERE 1=1
        `;


    } else if (user.role === 2) {

        // tecnico
        hotspotCondition = `
            WHERE h.is_active = true
            AND destination_scene.is_active = true
        `;


    } else {

        hotspotCondition = `
            WHERE 
                h.is_active = true

                AND destination_scene.is_active = true

                AND (
                    destination_scene.is_public = true

                    OR EXISTS (
                        SELECT 1
                        FROM permiso_x_escena px
                        WHERE px.scene_id = destination_scene.id_scene
                        AND px.permisox_id = $${index}
                    )
                )
        `;

        values.push(user.permisos_id);
        index++;

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

    -- 🔹 Kind
    s.kind_id,
    k.name_kind,

    -- 🔹 Floor
    s.floor_id,
    f.name_floor,

    -- 🔹 Tower
    s.tower_id,
    t.name_tower,

    -- 🔹 Orientation
    s.orientation_id,
    o.name_orientation,

    h.hotspots,
    r.interactions

  FROM scenes s

  LEFT JOIN imagenes img ON img.id_imagen = s.imagen_id
  LEFT JOIN kind k ON s.kind_id = k.id_kind
  LEFT JOIN floor f ON s.floor_id = f.id_floor
  LEFT JOIN tower t ON s.tower_id = t.id_tower
  LEFT JOIN orientation o ON s.orientation_id = o.id_orientation

  -- Subquery para hotspots
  LEFT JOIN (
      SELECT h.scene_id,
            json_agg(
              json_build_object(
                'id_hotspots', h.id_hotspots,
                'title', h.title,
                'yaw', h.yaw,
                'pitch', h.pitch,
                'description', h.description,
                'link_scene_id', h.link_scene_id,
                'icon_id', h.icon_id,
                'icon_url', i.icon_url,
                'name_icon', i.name_icon,
                'rotation', h.rotation,
                'h_is_active', h.is_active,
                'h_is_public', h.is_public,
                'h_link_scene_active', destination_scene.is_active,
                'h_link_scene_public', destination_scene.is_public
              )
            ) AS hotspots

      FROM hotspots h

      LEFT JOIN icons i ON h.icon_id = i.id_icon
      INNER JOIN scenes destination_scene ON destination_scene.id_scene = h.link_scene_id
      ${hotspotCondition}
      GROUP BY h.scene_id

  ) h ON s.id_scene = h.scene_id

  -- Subquery para interactions
  LEFT JOIN (
      SELECT r.scene_id,
            json_agg(
              json_build_object(
                'id_interactions', r.id_interactions,
                'title', r.title,
                'yaw', r.yaw,
                'pitch', r.pitch,
                'description', r.description,
                'link', r.link,
                'icon_id', r.icon_id,
                'icon_url', rc.icon_url,
                'name_icon', rc.name_icon,
                'rotation', r.rotation,
                'radius', r.radius,
                'type', r.type_id,
                'type_name', c.name,
                'width_px', r.width_px,
                'height_px', r.height_px,
                'api_key', r.api_key,
                'update_api', r.update_api,
                'r_is_active', r.is_active,
                'r_is_public', r.is_public
              )
            ) AS interactions

      FROM interactions r

      LEFT JOIN itypes c ON c.id_type = r.type_id
      LEFT JOIN icons rc ON r.icon_id = rc.id_icon
      ${interactionCondition}
      GROUP BY r.scene_id

  ) r ON s.id_scene = r.scene_id

  WHERE 1=1
    `;

        // if (isActive !== null) {
    //     query += ` AND s.is_active = $${index} `;
    //     values.push(isActive);
    //     index++;
    // }

   // CONTROL DE ACCESO

    if (!user) {

        // SIN LOGIN
        // Solo escenas activas y públicas
        query += `
            AND s.is_active = true
            AND s.is_public = true
        `;


    } else if (user.role === 1) {

        // ADMIN
        // Todo: activas, inactivas, públicas y privadas
        // query += `
        //     AND 1=1
        // `;


    } else if (user.role === 2) {

        // TÉCNICO
        // Todo excepto desactivadas
        query += `
            AND s.is_active = true
        `;


    } else {

        // USUARIO NORMAL
        // Solo activas
        // Públicas + privadas asignadas a su permiso

        query += `
            AND s.is_active = true
            AND (
                s.is_public = true

                OR EXISTS (
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

    query += `
        ORDER BY s.id_scene ASC;
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

    }
};


module.exports = Scenes;

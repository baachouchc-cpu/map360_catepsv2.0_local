
// src/models/scene.model.js

const pool = require("../services/db");

const Scenes = {

 getAllScenesWithHotspots: async (isActive = null) => {
    let query = `
    SELECT 
    s.id_scene,
    s.imagen_url,
    s.imagen_id,

    img.nombre_img,
    img.url_minio,
    img.tipo,

    s.is_active,
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
                'rotation', h.rotation
              )
            ) AS hotspots
      FROM hotspots h
      LEFT JOIN icons i ON h.icon_id = i.id_icon
      GROUP BY h.scene_id
  ) h ON s.id_scene = h.scene_id

  -- Subquery para interactions
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
                'update_api', r.update_api
              )
            ) AS interactions
      FROM interactions r
      LEFT JOIN itypes c ON c.id_type = r.type_id
      LEFT JOIN icons rc ON r.icon_id = rc.id_icon
      GROUP BY r.scene_id
  ) r ON s.id_scene = r.scene_id
    `;

    const values = [];

    if (isActive !== null) {
        query += ` WHERE s.is_active = $1 `;
        values.push(isActive);
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

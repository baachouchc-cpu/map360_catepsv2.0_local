// src/models/interactions.model.js  
const pool = require("../services/db");

const Interactions = {

  upsert: async (data) => {
    const {
      id_interactions,
      scene_id,
      title,
      yaw,
      pitch,
      description,
      link,
      icon_id,
      rotation,
      radius,
      type_id,
      width_px,
      height_px,
      pass_word,
      api_key,
      update_api
    } = data;
    // If an id is provided we perform an upsert using ON CONFLICT on that id.
    // If no id is provided we insert without the id column so the DB can
    // assign it (avoids inserting NULL into a NOT NULL serial/identity column).
    if (id_interactions) {
      const query = `
        INSERT INTO interactions (
          id_interactions,
          scene_id,
          title,
          yaw,
          pitch,
          description,
          link,
          icon_id,
          rotation,
          radius,
          type_id,
          width_px,
          height_px,
          pass_word,
          api_key,
          update_api
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,CASE 
        WHEN $14::text IS NULL OR $14::text = '' THEN NULL
          ELSE crypt($14::text, gen_salt('bf', 10))
        END, $15, $16)
        ON CONFLICT (id_interactions)
        DO UPDATE SET
          scene_id   = EXCLUDED.scene_id,
          title      = EXCLUDED.title,
          yaw        = EXCLUDED.yaw,
          pitch      = EXCLUDED.pitch,
          description= EXCLUDED.description,
          link       = EXCLUDED.link,
          icon_id    = EXCLUDED.icon_id,
          rotation   = EXCLUDED.rotation,
          radius     = EXCLUDED.radius,
          type_id    = EXCLUDED.type_id,
          width_px   = EXCLUDED.width_px,
          height_px  = EXCLUDED.height_px,
          pass_word  = COALESCE(EXCLUDED.pass_word, interactions.pass_word),
          api_key    = EXCLUDED.api_key,
          update_api    = EXCLUDED.update_api
        RETURNING *;
      `;

      const values = [
        id_interactions,
        scene_id,
        title,
        yaw,
        pitch,
        description || null,
        link || null,
        icon_id || null,
        rotation,
        radius || null,
        type_id,
        width_px || null,
        height_px || null,
        pass_word || null,
        api_key || null,
        update_api || null
      ];

      const { rows } = await pool.query(query, values);
      return rows[0];
    }

    // No id provided: insert and let the DB generate the id
    const insertQuery = `
      INSERT INTO interactions (
        scene_id,
        title,
        yaw,
        pitch,
        description,
        link,
        icon_id,
        rotation,
        radius,
        type_id,
        width_px,
        height_px,
        pass_word,
        api_key,
        update_api
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,CASE 
      WHEN $13::text IS NULL OR $13::text = '' THEN NULL
        ELSE crypt($13::text, gen_salt('bf', 10))
      END, $14, $15)
      RETURNING *;
    `;

    const insertValues = [
      scene_id,
      title,
      yaw,
      pitch,
      description || null,
      link || null,
      icon_id || null,
      rotation,
      radius || null,
      type_id,
      width_px || null,
      height_px || null,
      pass_word || null,
      api_key || null,
      update_api || null
    ];

    const { rows } = await pool.query(insertQuery, insertValues);
    return rows[0];
  },

  getAllInteractions: async (isActive = null) => {
    let query = `
      SELECT   
      i.*,  
      s.description AS scene_name,

      img.nombre_img AS nombre_interaccion,
      img.url_minio AS url_minio_interaccion,
      img.tipo AS img_tipo_interaccion,

      icon.nombre_img AS icon_name,
      icon.url_minio AS icon_url_minio,
      icon.tipo AS icon_tipo

      FROM interactions i 
      LEFT JOIN scenes s  ON s.id_scene = i.scene_id
      LEFT JOIN imagenes img ON img.id_imagen = i.imagen_id
      LEFT JOIN imagenes icon ON icon.id_imagen = i.icon_id
    
    `;
    //Cambiar por LEFT JOIN imagenes icon ON icon.id_imagen = i.imagen_icon_id, el que esta es antiguo
    const values = [];

    if (isActive !== null) {
      query += ` WHERE i.is_active = $1`;
      values.push(isActive);
    }

    query += `
        ORDER BY i.id_interactions;
    `;

    const { rows } = await pool.query(query, values);
    return rows;
  }

};

module.exports = Interactions;
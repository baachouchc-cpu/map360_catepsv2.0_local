const bcrypt = require("bcrypt");
const Interactions = require("../models/interactions.model");
const db = require("../services/db");

// CREATE + UPDATE (UPSERT)
const upsertInteraction = async (req, res) => {
  try {
    const {
      scene_id,
      title,
      yaw,
      pitch,
      rotation,
      icon_id,
      type_id      
    } = req.body;

    // Validación mínima
    if (
      !scene_id ||
      !title ||
      yaw === undefined ||
      pitch === undefined ||
      rotation === undefined ||
      !icon_id ||
      !type_id      
    ) {
      return res.status(400).json({
        error: "Faltan campos obligatorios"
      });
    }

    const interaction = await Interactions.upsert(req.body);

    res.status(200).json({
      message: "Interacción creada o actualizada correctamente",
      interaction
    });

  } catch (error) {
    console.error("UPSERT interaction error:", error);
    res.status(500).json({
      error: "Error interno del servidor"
    });
  }
};

// Controlador para obtener solo id y name de las escenas
const getNameTypes = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM itypes ORDER BY name"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo tipos de interacción" });
  }
};

// Controlador para obtener solo id y name de las escenas
const getNameIcon = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id_icon, name_icon FROM icons ORDER BY name_icon"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo iconos" });
  }
};

// GET BY ID
const getInteractionById = async (req, res) => {
  try {
      const { id } = req.params;

      const interaction = await Interactions.getInteractionById(id, req.user);

      if(!interaction){

          return res.status(404).json({
              error:"Interacción no encontrada"
          });

      }

      res.json(interaction);

  } catch (error) {
    console.error("GET interaction error:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// UPDATE SOLO DESCRIPCIÓN
const updateInteractionDescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ error: "Descripción requerida" });
    }

    await db.query(
      "UPDATE interactions SET description = $1 WHERE id_interactions = $2",
      [description, id]
    );

    res.json({ message: "Descripción actualizada" });

  } catch (error) {
    console.error("UPDATE description error:", error);
    res.status(500).json({ error: "Error interno" });
  }
};

const validateInteractionPassword = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  try {
    const result = await db.query(
      "SELECT pass_word FROM interactions WHERE id_interactions = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Interacción no encontrada" });
    }
    
    const savedPassword = result.rows[0].pass_word;

    // 🔐 Comparar contraseña
    const ok = await bcrypt.compare(password, savedPassword);
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

    res.json({ access: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

async function getAllInteractions(req, res) {
    try {

        const interaction = await Interactions.getAllInteractions(req.user);

        res.json(interaction);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Error retrieving active interactions"
        });

    }
}

async function getActiveInteractions(req, res) {
    try {

        const interactions = await Interactions.getAllInteractions(true);

        res.json(interactions);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Error retrieving active interactions"
        });

    }
}

async function updateInteractionStatus(req, res) {

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
            UPDATE interactions
            SET
                is_active = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id_interactions = $2
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

async function updateInteractionPublic(req, res) {

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
            UPDATE interactions
            SET
                is_public = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id_interactions = $2
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

module.exports = {
  upsertInteraction,
  getInteractionById,
  updateInteractionDescription,
  validateInteractionPassword,
  getNameTypes,
  getNameIcon,
  getAllInteractions,
  getActiveInteractions,
  updateInteractionStatus,
  updateInteractionPublic
};
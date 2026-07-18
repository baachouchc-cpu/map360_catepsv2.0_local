// src/models/users.model.js
const db = require("../services/db");

const getUserByName = async (name) => {
  const query = `
    SELECT 
      id_user, 
      name_user, 
      pass_user, 
      rol_id, 
      permisos_id,
      is_config,
      -- Concatenamos nombre y apellido con un espacio intermedio. 
      -- COALESCE evita que devuelva NULL si alguno de los campos está vacío en la BD.
      TRIM(CONCAT(COALESCE(nombre, ''), ' ', COALESCE(apellido, ''))) AS nombre_completo
    FROM public.users 
    WHERE name_user = $1
  `;

  const { rows } = await db.query(query, [name]);
  return rows[0];
};
/**
 * Obtiene todas las escenas permitidas para un ID de permiso específico
 * @param {number} permisosId - El id_permiso del usuario
 */
const getEscenasPorPermiso = async (permisosId) => {
  if (!permisosId) return []; // Si el usuario no tiene permisos asignados

  const query = `
    SELECT s.id_scene, s.description -- o los campos que tenga tu tabla 'scenes'
    FROM public.permiso_x_escena pxe
    JOIN public.scenes s ON pxe.scene_id = s.id_scene
    WHERE pxe.permisox_id = $1
  `;

  const { rows } = await db.query(query, [permisosId]);
  return rows; // Esto te devolverá un array limpio de objetos escena: [{id_scene: 1}, {id_scene: 2}]
};

const getUserById = async (id) =>{

    const query = `

        SELECT

            u.*,

            CONCAT(
                u.nombre,
                ' ',
                u.apellido
            ) AS nombre_completo

        FROM users u

        WHERE u.id_user = $1

    `;

    const { rows } =
        await db.query(query,[id]);

    return rows[0];

}

module.exports = {
  getUserByName,
  getEscenasPorPermiso,
  getUserById
};
// const db = require("../services/db");

// const getUserByName = async (name) => {
//   const { rows } = await db.query(
//     "SELECT * FROM users WHERE name_user = $1",
//     [name]
//   );
//   return rows[0];
// };

// module.exports = {
//   getUserByName
// };

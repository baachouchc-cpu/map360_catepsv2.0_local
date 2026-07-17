// src/models/users.model.js
const db = require("../services/db");

const getUserByName = async (name) => {
  // Ahora buscamos por 'name_user' y traemos 'is_config'
  const { rows } = await db.query(
    "SELECT id_user, name_user, pass_user, rol_id, is_config FROM users WHERE name_user = $1",
    [name]
  );
  return rows[0];
};

module.exports = {
  getUserByName
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

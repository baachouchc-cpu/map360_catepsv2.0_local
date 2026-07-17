// src/controllers/auth.controller.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Users = require("../models/users.model");

const login = async (req, res) => {
  const { name, password } = req.body;

  // 1. Buscamos al usuario (usará la consulta actualizada con user_name)
  const user = await Users.getUserByName(name);
  if (!user) return res.status(401).json({ error: "Credencialess inválidas" });

  // 2. Comparamos la contraseña encriptada
  const ok = await bcrypt.compare(password, user.pass_user);
  if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

  // 3. Agregamos 'is_config' en el payload del JWT para usarlo en los middlewares
  const token = jwt.sign(
    { 
      id: user.id_user, 
      role: user.rol_id,
      isConfig: user.is_config // Guardamos el booleano de acceso aquí
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  // 4. Guardamos el token en las cookies
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax"
  });

  // 5. Devolvemos respuesta con la información básica
  res.json({ 
    message: "Login correcto", 
    user: {
      username: user.user_name,
      role: user.rol_id,
      isConfig: user.is_config // Útil para que tu frontend reaccione
    } 
  });
};

const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout OK" });
};

module.exports = { login, logout };

// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const Users = require("../models/users.model");

// const login = async (req, res) => {
//   const { name, password } = req.body;

//   const user = await Users.getUserByName(name);
//   if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

//   const ok = await bcrypt.compare(password, user.pass_user);
//   if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

//   const token = jwt.sign(
//     { id: user.id_user, role: user.rol_id },
//     process.env.JWT_SECRET,
//     { expiresIn: "1h" }
//   );

//   res.cookie("token", token, {
//     httpOnly: true,
//     sameSite: "lax"
//   });

//   res.json({ message: "Login correcto", user: {
//       username: user.name_user,
//       role: user.rol_id
//     } });
// };

// const logout = (req, res) => {
//   res.clearCookie("token");
//   res.json({ message: "Logout OK" });
// };

// module.exports = { login, logout };

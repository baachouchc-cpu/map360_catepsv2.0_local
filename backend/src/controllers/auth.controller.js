// src/controllers/auth.controller.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Users = require("../models/users.model");

const login = async (req, res) => {
  const { login_name, password } = req.body;
  try {
    // 1. Buscamos al usuario (usará la consulta actualizada con user_name)
    const user = await Users.getUserByName(login_name);
    if (!user) return res.status(401).json({ error: "Credencialess inválidas" });

    // 2. Comparamos la contraseña encriptada
    const ok = await bcrypt.compare(password, user.pass_user);
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });
    
    // 3. Buscamos las escenas permitidas usando el permisos_id que viene en el usuario
    const escenasPermitidas = await Users.getEscenasPorPermiso(user.permisos_id); 

    // 3. Agregamos 'is_config' en el payload del JWT para usarlo en los middlewares
    const token = jwt.sign(
      { 
        id: user.id_user, 
        role: user.rol_id,
        isConfig: user.is_config, // Guardamos el booleano de acceso aquí
        permisos_id: user.permisos_id
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 4. Guardamos el token en las cookies
    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    });

    // 5. Devolvemos respuesta con la información básica
    res.json({ 
      message: "Login correcto", 
      user: {
          username: user.name_user, // Corregido a name_user (el campo real de tu tabla)
          nombreCompleto: user.nombre_completo,
          role: user.rol_id,
          isConfig: user.is_config,
          idPermiso: user.permisos_id
        },
        // Pasamos un array limpio con los IDs de las escenas permitidas: [1, 4, 8]
        escenas: escenasPermitidas.map(e => e.id_scene)
      });
} catch (error) {
    console.error("Error en el login:", error);
    return res.status(500).json({ 
      ok: false, 
      message: "Error interno del servidor" 
    });
  }
};

const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout OK" });
};

const me = async (req, res) => {

    if (!req.user) {

        return res.json({
            authenticated: false
        });

    }

    try {

        const user =
            await Users.getUserById(req.user.id);

        if (!user) {

            return res.json({
                authenticated: false
            });

        }

        const escenas =
            await Users.getEscenasPorPermiso(
                user.permisos_id
            );

        res.json({

            authenticated: true,

            user: {

                id: user.id_user,
                username: user.name_user,
                nombreCompleto: user.nombre_completo,
                role: user.rol_id,
                isConfig: user.is_config,
                idPermiso: user.permisos_id

            },

            escenas: escenas.map(e => e.id_scene)

        });

    } catch (err) {

        console.error(err);

        res.status(500).json({

            error: "Error obteniendo usuario"

        });

    }

};

module.exports = { login, logout, me };

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

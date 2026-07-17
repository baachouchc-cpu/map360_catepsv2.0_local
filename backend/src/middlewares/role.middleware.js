// src/middlewares/role.middleware.js

/**
 * Middleware para proteger rutas administrativas basadas en la bandera 'is_config'
 */
module.exports = () => {
  return (req, res, next) => {
    // Si no está autenticado (el middleware de autenticación previa no seteó req.user)
    if (!req.user) {
      return res.redirect("/admin/login");
    }

    // Si el usuario no tiene la bandera 'isConfig' activa en su JWT
    if (!req.user.isConfig) {
      // Si es una petición de API, respondemos con 403. 
      // Si es una vista HTML, podrías redirigirlo a una página de acceso denegado.
     return res.send(`
        <script>
          alert("Acceso denegado: No tienes permisos de configuración.");
          window.location.href = "/admin/login";
        </script>
      `);
    }

    // Si tiene el permiso activo, le permitimos continuar a la ruta
    next();
  };
};
// module.exports = (requiredRole) => {
//   return (req, res, next) => {
//     if (!req.user) {
//       return res.redirect("/admin/login");
//     }

//     if (req.user.role !== requiredRole) {
//       return res.status(403).send("Acceso denegado");
//     }

//     next();
//   };
// };

// module.exports = (roles = []) => {
//   return (req, res, next) => {

//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({ error: "Acceso denegado" });
//     }
//     next();
//   };
// };

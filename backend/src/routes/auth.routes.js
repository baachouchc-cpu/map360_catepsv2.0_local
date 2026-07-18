// src/routes/auth.routes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/auth.controller");
const optionalAuth =require("../middlewares/optionalAuth.middleware");

router.post("/login", controller.login);
router.post("/logout", controller.logout);
router.get("/me", optionalAuth, controller.me);

module.exports = router;

// const express = require("express");
// const router = express.Router();

// router.post("/login", (req, res) => {
//   const { user, pass, interactionId } = req.body;

//   if (
//     user === process.env.ADMIN_USER &&
//     pass === process.env.ADMIN_PASS
//   ) {
//     res.cookie("adminAuth", "true", {
//       httpOnly: true,
//       sameSite: "lax",
//     });

//     // Guardar interacción pendiente si viene
//     if (interactionId) {
//       res.cookie("interactionId", interactionId, {
//         httpOnly: true,
//         sameSite: "strict",
//       });
//     }

//     return res.json({ ok: true });
//   }

//   return res.status(401).json({ error: "Credenciales incorrectos" });
// });

// router.post("/logout", (req, res) => {
//   res.clearCookie("adminAuth");
//   res.clearCookie("interactionId");
//   res.json({ ok: true });
// });

// /**
//  * Nuevo GET para obtener la interacción pendiente
//  */
// router.get("/pending", (req, res) => {
//   const interactionId = req.cookies.interactionId || null;
//   return res.json({ interactionId });
// });

// module.exports = router;

// src/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect("/admin/login");
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    req.user.configMode = req.headers["x-config-mode"] === "true";
    next();
  } catch (err) {
    return res.redirect("/admin/login");
  }
};

// module.exports = (req, res, next) => {
//   if (!req.cookies || !req.cookies.adminAuth) {
//     return res.redirect("/admin/login");
//   }
//   next();
// };

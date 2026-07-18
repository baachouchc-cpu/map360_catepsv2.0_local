// Cargar variables de entorno primero
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require("path");
const cookieParser = require("cookie-parser");

const app = express();
const { PORT } = require('./config/server');

// Rutas API
const scenesRoutes = require('./routes/scenes.routes');
const routesRoutes = require("./routes/routes.routes");
const searchRoutes = require("./routes/search.routes");
const interactionsRoutes = require("./routes/interactions.routes");
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const imageRoutes = require("./routes/images.routes");
const hotspotsRoutes = require("./routes/hotspots.routes");

// Middleware auth
const auth = require("./middlewares/auth.middleware");
const role = require("./middlewares/role.middleware");
const authMiddleware = require("./middlewares/authMiddleware");
const optionalAuth = require("./middlewares/optionalAuth.middleware");
const corsOptions = {
    origin: [
        "http://localhost:5000",
        "http://127.0.0.1:5000"
    ],
    credentials: true
};

// Middlewares globales
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// Auth API
app.use("/api/auth", authRoutes);
app.use('/api/scenes', optionalAuth, scenesRoutes);
app.use('/api', routesRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/interactions", interactionsRoutes);
app.use("/api/users", auth, role, authRoutes); // Corregido: cambiamos el "require" por la variable authRoutes
app.use("/api/admin", adminRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/navegation", hotspotsRoutes);


// FRONTEND STATIC
const frontendPath = path.join(__dirname, "../../marzipano");

// Viewer (Marzipano)
app.use(
  "/viewer",
  express.static(path.join(frontendPath, "viewer"))
);

// Sirve viewer como raíz
app.use(
  "/",
  express.static(path.join(frontendPath, "viewer"))
);

// Admin estáticos
const adminPath = path.join(frontendPath, "admin");

// LOGIN (SIN protección)
app.get("/admin/login", (req, res) => {
  res.sendFile(path.join(adminPath, "pages", "login.html"));
});

// PANEL ADMIN (PROTEGIDO)
app.get("/admin", authMiddleware, role(1), (req, res) => {
  res.sendFile(path.join(adminPath, "pages", "index.html"));
});

app.get("/tecnic", authMiddleware, role(2), (req, res) => {
  res.sendFile(path.join(adminPath, "pages", "tecnic.html"));
});

// Archivos estáticos admin (css/js)
app.use("/admin", express.static(adminPath));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
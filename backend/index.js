const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./src/config/db"); // Conexión a la base de datos

const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");

const app = express();

// ✅ Configuración correcta de CORS
app.use(cors({
    origin: "http://localhost:5173", // Permite solicitudes desde el frontend
    credentials: true, // Permite envío de cookies y encabezados de autenticación
}));

// Configuración de middleware
app.use(express.json());

// Definir rutas
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Ruta de prueba para verificar el funcionamiento del servidor
app.get("/", (req, res) => {
    res.send("API funcionando correctamente.");
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
});

const express = require("express");
const router = express.Router();
const { login, register } = require("../controllers/authControllers");
const { getPerfil, logout } = require("../controllers/userControllers");
const authMiddleware = require("../middlewares/authMiddleware");

// Rutas de autenticación
router.post("/login", login);
router.post("/register", register);
router.get("/logout", authMiddleware, logout); // ✅ Cambio a GET y protegido

// Ruta protegida
router.get("/perfil", authMiddleware, getPerfil);

module.exports = router;

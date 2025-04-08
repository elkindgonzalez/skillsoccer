const express = require("express");
const { 
    obtenerUsuarios, 
    obtenerUsuarioPorId, 
    crearUsuario, 
    actualizarUsuario, 
    eliminarUsuario 
} = require("../controllers/userControllers");

const authMiddleware = require("../middlewares/authMiddleware"); // Importar middleware de autenticación

const router = express.Router();

// Rutas protegidas con autenticación
router.get("/", authMiddleware, obtenerUsuarios);
router.get("/:id", authMiddleware, obtenerUsuarioPorId);
router.post("/", authMiddleware, crearUsuario);
router.put("/:id", authMiddleware, actualizarUsuario);
router.delete("/:id", authMiddleware, eliminarUsuario);

module.exports = router;


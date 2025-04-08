const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Registro de usuario
const register = async (req, res) => {
    const { nombre, email, password, telefono, fecha_nacimiento, direccion, rol_id } = req.body;

    if (!nombre || !email || !password || !rol_id) {
        return res.status(400).json({ error: "Todos los campos obligatorios deben estar completos" });
    }

    try {
        // Verificar si el email ya existe
        const [existingUser] = await db.query("SELECT id FROM usuarios WHERE email = ?", [email]);

        if (existingUser.length > 0) {
            return res.status(400).json({ error: "El email ya está registrado" });
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar nuevo usuario
        const query = "INSERT INTO usuarios (nombre, email, password, telefono, fecha_nacimiento, direccion, rol_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
        const [result] = await db.query(query, [nombre, email, hashedPassword, telefono, fecha_nacimiento, direccion, rol_id]);

        return res.status(201).json({ message: "Usuario registrado con éxito", userId: result.insertId });

    } catch (error) {
        console.error("❌ Error en el registro:", error.message);
        return res.status(500).json({ error: "Error en el servidor" });
    }
};

// Inicio de sesión
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email y contraseña son obligatorios" });
    }

    try {
        const query = "SELECT id, nombre, email, password, rol_id FROM usuarios WHERE email = ?";
        const [results] = await db.query(query, [email]);

        if (results.length === 0) {
            return res.status(401).json({ error: "Usuario no encontrado" });
        }

        const usuario = results[0];
        const isMatch = await bcrypt.compare(password, usuario.password);

        if (!isMatch) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        // Generar token JWT
        const token = jwt.sign(
            { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol_id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // Enviar token como cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        return res.status(200).json({
            message: "Inicio de sesión exitoso",
            user: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol_id },
            token,
        });

    } catch (error) {
        console.error("❌ Error en el login:", error.message);
        return res.status(500).json({ error: "Error en el servidor" });
    }
};

module.exports = { register, login };

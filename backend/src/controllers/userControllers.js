const db = require("../config/db");
const bcrypt = require("bcrypt");

// Obtener todos los usuarios
const obtenerUsuarios = async (req, res) => {
    try {
        const [results] = await db.query(
            "SELECT id, nombre, email, telefono, fecha_nacimiento, direccion, rol_id FROM usuarios"
        );
        res.json(results);
    } catch (error) {
        console.error("❌ Error obteniendo usuarios:", error);
        res.status(500).json({ error: "Error en el servidor" });
    }
};

// Obtener un usuario por ID
const obtenerUsuarioPorId = async (req, res) => {
    const { id } = req.params;
    try {
        const [results] = await db.query(
            "SELECT id, nombre, email, telefono, fecha_nacimiento, direccion, rol_id FROM usuarios WHERE id = ?",
            [id]
        );

        if (results.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json(results[0]);
    } catch (error) {
        console.error("❌ Error obteniendo usuario:", error);
        res.status(500).json({ error: "Error en el servidor" });
    }
};

// Obtener perfil del usuario autenticado
const getPerfil = async (req, res) => {
    try {
        const userId = req.user.id;

        const query = "SELECT id, nombre, email, telefono, fecha_nacimiento, direccion, rol_id FROM usuarios WHERE id = ?";
        const [results] = await db.query(query, [userId]);

        if (results.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        return res.status(200).json({ user: results[0] });
    } catch (error) {
        console.error("❌ Error obteniendo perfil:", error.message);
        return res.status(500).json({ error: "Error en el servidor" });
    }
};

// Cerrar sesión eliminando el token
const logout = (req, res) => {
    res.clearCookie("token"); // Eliminar la cookie del token
    return res.status(200).json({ message: "Sesión cerrada correctamente" });
};

// Crear un nuevo usuario
const crearUsuario = async (req, res) => {
    const { nombre, email, password, telefono, fecha_nacimiento, direccion, rol_id } = req.body;

    if (!nombre || !email || !password || !rol_id) {
        return res.status(400).json({ error: "Todos los campos obligatorios deben estar completos" });
    }

    try {
        // Verificar si el email ya está en uso
        const [existingUser] = await db.query("SELECT id FROM usuarios WHERE email = ?", [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ error: "El email ya está registrado" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const query = "INSERT INTO usuarios (nombre, email, password, telefono, fecha_nacimiento, direccion, rol_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
        const [result] = await db.query(query, [nombre, email, hashedPassword, telefono, fecha_nacimiento, direccion, rol_id]);

        res.status(201).json({ message: "Usuario creado con éxito", userId: result.insertId });
    } catch (error) {
        console.error("❌ Error creando usuario:", error);
        res.status(500).json({ error: "Error en el servidor" });
    }
};

// Actualizar un usuario por ID
const actualizarUsuario = async (req, res) => {
    const { id } = req.params;
    const { nombre, email, password, telefono, fecha_nacimiento, direccion, rol_id } = req.body;

    try {
        // Verificar si el usuario existe
        const [userExists] = await db.query("SELECT * FROM usuarios WHERE id = ?", [id]);
        if (userExists.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        // Verificar si el nuevo email ya está en uso por otro usuario
        if (email) {
            const [emailExists] = await db.query("SELECT id FROM usuarios WHERE email = ? AND id != ?", [email, id]);
            if (emailExists.length > 0) {
                return res.status(400).json({ error: "El email ya está en uso por otro usuario" });
            }
        }

        let query = "UPDATE usuarios SET nombre = ?, email = ?, telefono = ?, fecha_nacimiento = ?, direccion = ?, rol_id = ? WHERE id = ?";
        let values = [nombre, email, telefono, fecha_nacimiento, direccion, rol_id, id];

        // Si se proporciona una nueva contraseña, la encripta y la actualiza
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query = "UPDATE usuarios SET nombre = ?, email = ?, password = ?, telefono = ?, fecha_nacimiento, direccion = ?, rol_id = ? WHERE id = ?";
            values = [nombre, email, hashedPassword, telefono, fecha_nacimiento, direccion, rol_id, id];
        }

        const [result] = await db.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({ message: "Usuario actualizado con éxito" });
    } catch (error) {
        console.error("❌ Error actualizando usuario:", error);
        res.status(500).json({ error: "Error en el servidor" });
    }
};

// Eliminar un usuario por ID
const eliminarUsuario = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query("DELETE FROM usuarios WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({ message: "Usuario eliminado con éxito" });
    } catch (error) {
        console.error("❌ Error eliminando usuario:", error);
        res.status(500).json({ error: "Error en el servidor" });
    }
};

module.exports = {
    obtenerUsuarios,
    obtenerUsuarioPorId,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    getPerfil, // ✅ Se agregó exportación
    logout,    // ✅ Se agregó exportación
};

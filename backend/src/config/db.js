require('dotenv').config();
const mysql = require('mysql2/promise'); // Usamos mysql2 con promesas

// Crear conexión a la base de datos
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,  // Máximo número de conexiones simultáneas
    queueLimit: 0
});

// Probar conexión
pool.getConnection()
    .then((connection) => {
        console.log('✅ Conectado a la base de datos MySQL.');
        connection.release();
    })
    .catch((err) => {
        console.error('❌ Error conectando a la base de datos:', err.message);
    });

module.exports = pool;


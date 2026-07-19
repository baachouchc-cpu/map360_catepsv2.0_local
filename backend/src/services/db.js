const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: {
    rejectUnauthorized: false // importante para Aiven Free
  }
});

// pool.connect()
//   .then(() => console.log('Conexión a PostgreSQL exitosa'))
//   .catch(err => console.error('Error al conectar a PostgreSQL:', err));

pool.query("SELECT NOW()")

    .then(() => {

        console.log(
            "Conexión a PostgreSQL exitosa"
        );

    })

    .catch(err => {

        console.error(
            "Error al conectar a PostgreSQL:",
            err.message
        );

    });

// module.exports = {
//   query: (text, params) => pool.query(text, params),
//   connect: () => pool.connect()
// };
module.exports = pool;
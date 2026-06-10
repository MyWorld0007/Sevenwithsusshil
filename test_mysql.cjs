const mysql = require("mysql2/promise");

async function checkDb() {
  const pool = mysql.createPool({
    host: '193.203.184.86',
    user: 'u709894810_masteradmin',
    password: '@Masteradmin_2026',
    database: 'u709894810_sevenastro',
    waitForConnections: true,
  });
  try {
    const [rows] = await pool.query("SELECT * FROM testimonials");
    console.log("MySQL Testimonials:", rows);
  } catch (err) {
    console.log("Error:", err.message);
  }
  process.exit(0);
}
checkDb();

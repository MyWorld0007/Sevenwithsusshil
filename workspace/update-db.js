const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const finalHost = process.env.DB_HOST?.includes('sevenastro') ? '193.203.184.86' : (process.env.DB_HOST || '193.203.184.86');
  const finalUser = process.env.DB_USER === 'masteradmin' ? 'u709894810_masteradmin' : (process.env.DB_USER || 'u709894810_masteradmin');
  const finalPassword = process.env.DB_PASSWORD || '@Masteradmin_2026';
  const finalName = process.env.DB_NAME === 'sevenastro' ? 'u709894810_sevenastro' : (process.env.DB_NAME || 'u709894810_sevenastro');

  const pool = mysql.createPool({
    host: finalHost,
    user: finalUser,
    password: finalPassword,
    database: finalName,
    port: 3306,
  });

  try {
    const [result] = await pool.query(
      `UPDATE services SET title = 'Gemstone, Crystal, Rudraksha & Yantra Recommendation' WHERE title LIKE '%Gemstone, Crystal%'`
    );
    console.log('Update result:', result);
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

run();

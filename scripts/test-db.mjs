import dotenv from 'dotenv';
import { createPool } from '../db.js';

dotenv.config();

const pool = createPool();
try {
  await pool.query('SELECT 1 AS ok');
  const tables = await pool.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
  );
  console.log('Connected OK');
  console.log('Tables:', tables.rows.map((r) => r.table_name).join(', ') || '(none yet)');
} catch (e) {
  console.error('FAIL:', e.message);
  process.exit(1);
} finally {
  await pool.end();
}

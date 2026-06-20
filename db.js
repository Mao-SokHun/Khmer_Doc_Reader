import { Pool } from 'pg';

function shouldUseSsl(connectionString) {
  if (process.env.PGSSLMODE === 'disable') return false;
  if (process.env.PGSSL === 'true') return true;
  if (/sslmode=(require|verify-full|verify-ca)/i.test(connectionString)) return true;
  return connectionString.includes('neon.tech');
}

export function createPool() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (databaseUrl) {
    const ssl = shouldUseSsl(databaseUrl) ? { rejectUnauthorized: false } : undefined;
    return new Pool({
      connectionString: databaseUrl,
      ssl,
      max: Number(process.env.PGPOOL_MAX || (process.env.VERCEL ? 1 : 10)),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 15_000,
    });
  }

  return new Pool({
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    database: process.env.PGDATABASE || 'postgres',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    max: Number(process.env.PGPOOL_MAX || 10),
  });
}

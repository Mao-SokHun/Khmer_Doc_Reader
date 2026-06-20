import { Pool } from 'pg';

function shouldUseSsl(connectionString) {
  if (process.env.PGSSLMODE === 'disable') return false;
  if (process.env.PGSSL === 'true') return true;
  if (/sslmode=(require|verify-full|verify-ca)/i.test(connectionString)) return true;
  return connectionString.includes('neon.tech');
}

/** Neon direct connections can hang on Vercel serverless — use the pooler host. */
function normalizeDatabaseUrl(connectionString) {
  const url = connectionString.trim();
  if (!process.env.VERCEL || !url.includes('neon.tech') || url.includes('-pooler.')) {
    return url;
  }
  return url.replace(/@(ep-[^./?]+)\./, '@$1-pooler.');
}

export function createPool() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (databaseUrl) {
    const connectionString = normalizeDatabaseUrl(databaseUrl);
    const ssl = shouldUseSsl(connectionString) ? { rejectUnauthorized: false } : undefined;
    return new Pool({
      connectionString,
      ssl,
      max: Number(process.env.PGPOOL_MAX || (process.env.VERCEL ? 1 : 10)),
      idleTimeoutMillis: process.env.VERCEL ? 5_000 : 30_000,
      connectionTimeoutMillis: process.env.VERCEL ? 10_000 : 15_000,
    });
  }

  return new Pool({
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    database: process.env.PGDATABASE || 'postgres',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    max: Number(process.env.PGPOOL_MAX || (process.env.VERCEL ? 1 : 10)),
  });
}

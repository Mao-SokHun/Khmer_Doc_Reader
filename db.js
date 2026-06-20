import pg from 'pg';
import { neonConfig, Pool as NeonPool } from '@neondatabase/serverless';
import ws from 'ws';

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

function withNeonServerlessCompat(connectionString) {
  let url = connectionString;
  if (!/[?&]sslmode=/.test(url)) {
    url += `${url.includes('?') ? '&' : '?'}sslmode=require`;
  }
  if (!/[?&]uselibpqcompat=/.test(url)) {
    url += '&uselibpqcompat=true';
  }
  return url;
}

export function createPool() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (databaseUrl) {
    const connectionString = withNeonServerlessCompat(normalizeDatabaseUrl(databaseUrl));
    const ssl = shouldUseSsl(connectionString) ? { rejectUnauthorized: false } : undefined;

    if (process.env.VERCEL && connectionString.includes('neon.tech')) {
      neonConfig.webSocketConstructor = ws;
      return new NeonPool({
        connectionString,
        max: Number(process.env.PGPOOL_MAX || 1),
      });
    }

    return new pg.Pool({
      connectionString,
      ssl,
      max: Number(process.env.PGPOOL_MAX || 10),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 15_000,
    });
  }

  return new pg.Pool({
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    database: process.env.PGDATABASE || 'postgres',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    max: Number(process.env.PGPOOL_MAX || 10),
  });
}

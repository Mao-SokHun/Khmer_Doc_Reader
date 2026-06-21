/**
 * Set GEMINI_API_KEY on Vercel from local .env
 * Usage:
 *   VERCEL_TOKEN=xxx node scripts/set-vercel-gemini.mjs
 *   VERCEL_TOKEN=xxx VERCEL_PROJECT=khmer-lesson-doc node scripts/set-vercel-gemini.mjs
 *
 * Token: https://vercel.com/account/tokens
 */
import dotenv from 'dotenv';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: join(root, '.env') });

const token = (process.env.VERCEL_TOKEN || '').trim();
const projectName = (process.env.VERCEL_PROJECT || 'khmer-lesson-doc').trim();
const teamId = (process.env.VERCEL_TEAM_ID || '').trim();

function normalizeKey(raw) {
  return String(raw || '')
    .replace(/^\uFEFF/, '')
    .trim()
    .replace(/^["']|["']$/g, '');
}

let apiKey = normalizeKey(process.env.GEMINI_API_KEY);
if (!apiKey) {
  try {
    const envText = readFileSync(join(root, '.env'), 'utf8');
    const line = envText.split(/\r?\n/).find((l) => /^\s*GEMINI_API_KEY\s*=/.test(l));
    if (line) apiKey = normalizeKey(line.split('=').slice(1).join('='));
  } catch {
    /* ignore */
  }
}

const PLACEHOLDERS = new Set(['', 'MY_GEMINI_API_KEY', 'your_key', 'your_gemini_api_key']);
if (PLACEHOLDERS.has(apiKey)) {
  console.error('GEMINI_API_KEY missing or placeholder in .env');
  process.exit(1);
}

if (!token) {
  console.error('Set VERCEL_TOKEN (create at https://vercel.com/account/tokens)');
  process.exit(1);
}

const base = 'https://api.vercel.com';
const teamQuery = teamId ? `?teamId=${encodeURIComponent(teamId)}` : '';

async function vercelFetch(path, init = {}) {
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`${res.status} ${JSON.stringify(body)}`);
  }
  return body;
}

async function getProject() {
  const data = await vercelFetch(`/v9/projects/${encodeURIComponent(projectName)}${teamQuery}`);
  return data;
}

async function upsertEnv(projectId) {
  const existing = await vercelFetch(
    `/v9/projects/${projectId}/env${teamQuery}`
  );
  const targets = ['production', 'preview', 'development'];
  const current = (existing.envs || []).filter((e) => e.key === 'GEMINI_API_KEY');

  for (const env of current) {
    await vercelFetch(`/v9/projects/${projectId}/env/${env.id}${teamQuery}`, {
      method: 'DELETE',
    });
    console.log(`Removed old GEMINI_API_KEY (${env.target?.join?.(',') || env.type})`);
  }

  for (const target of targets) {
    await vercelFetch(`/v10/projects/${projectId}/env${teamQuery}`, {
      method: 'POST',
      body: JSON.stringify({
        key: 'GEMINI_API_KEY',
        value: apiKey,
        type: 'encrypted',
        target: [target],
      }),
    });
    console.log(`Added GEMINI_API_KEY → ${target}`);
  }
}

async function redeploy(projectId) {
  const deployments = await vercelFetch(
    `/v6/deployments?projectId=${projectId}&limit=1${teamId ? `&teamId=${encodeURIComponent(teamId)}` : ''}`
  );
  const latest = deployments.deployments?.[0];
  if (!latest?.uid) {
    console.log('No deployment to redeploy — push to Git or deploy from dashboard.');
    return;
  }
  await vercelFetch(`/v13/deployments${teamQuery}`, {
    method: 'POST',
    body: JSON.stringify({ deploymentId: latest.uid, name: projectName, target: 'production' }),
  });
  console.log('Redeploy triggered for production.');
}

const project = await getProject();
console.log(`Project: ${project.name} (${project.id})`);
await upsertEnv(project.id);
try {
  await redeploy(project.id);
} catch (e) {
  console.warn('Redeploy skipped:', e.message);
  console.warn('Redeploy manually: Vercel → Deployments → Redeploy');
}
console.log('Done.');

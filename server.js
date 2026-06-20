import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createPool } from './db.js';
import {
  geminiFormatMarkdown,
  geminiGenerateImage,
  geminiGenerateLesson,
  geminiTranslateMarkdown,
  isGeminiConfigured,
} from './lib/geminiServer.js';
import { verifyGoogleIdToken } from './lib/googleAuth.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.API_PORT || 3001);

const pool = createPool();
const dbLabel = process.env.DATABASE_URL?.trim()
  ? 'Neon PostgreSQL'
  : `${process.env.PGHOST || 'localhost'}:${process.env.PGPORT || 5432}`;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

const toFolder = (row) => ({
  id: row.id,
  name: row.name,
  ownerId: row.owner_id,
  order: row.order_index,
});

const toLesson = (row) => ({
  id: row.id,
  folderId: row.folder_id,
  title: row.title,
  content: row.content,
  ownerId: row.owner_id,
  order: row.order_index,
  tags: Array.isArray(row.tags) ? row.tags : [],
  isFavorite: Boolean(row.is_favorite),
});

const toSnapshot = (row) => ({
  id: row.id,
  lessonId: row.lesson_id,
  ownerId: row.owner_id,
  title: row.title,
  content: row.content,
  triggerType: row.trigger_type,
  createdAt: row.created_at,
});

const initDb = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS folders (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      name TEXT NOT NULL,
      order_index INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY,
      folder_id TEXT NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
      owner_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      order_index INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS lesson_snapshots (
      id TEXT PRIMARY KEY,
      lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
      owner_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      trigger_type TEXT NOT NULL DEFAULT 'manual',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query('CREATE INDEX IF NOT EXISTS idx_folders_owner ON folders(owner_id);');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_lessons_owner ON lessons(owner_id);');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_lessons_folder ON lessons(folder_id);');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_snapshots_lesson_created ON lesson_snapshots(lesson_id, created_at DESC);');

  await pool.query(`ALTER TABLE lessons ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';`);
  await pool.query(`ALTER TABLE lessons ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN NOT NULL DEFAULT false;`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS lesson_shares (
      id TEXT PRIMARY KEY,
      lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL DEFAULT 'viewer',
      access TEXT NOT NULL DEFAULT 'anyone',
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query('CREATE INDEX IF NOT EXISTS idx_lesson_shares_token ON lesson_shares(token);');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_accounts (
      owner_id TEXT PRIMARY KEY,
      email TEXT,
      name TEXT,
      picture TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS classroom_shares (
      id TEXT PRIMARY KEY,
      folder_id TEXT NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
      owner_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query('CREATE INDEX IF NOT EXISTS idx_classroom_shares_token ON classroom_shares(token);');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS lesson_reads (
      id TEXT PRIMARY KEY,
      share_token TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      reader_id TEXT NOT NULL,
      read_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query('CREATE INDEX IF NOT EXISTS idx_lesson_reads_token ON lesson_reads(share_token, lesson_id);');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS quiz_submissions (
      id TEXT PRIMARY KEY,
      share_token TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      reader_id TEXT NOT NULL,
      selected_index INTEGER NOT NULL,
      is_correct BOOLEAN NOT NULL,
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query('CREATE INDEX IF NOT EXISTS idx_quiz_submissions_token ON quiz_submissions(share_token, lesson_id);');
};

let dbReady = null;
const ensureDb = () => {
  if (!dbReady) {
    dbReady = initDb().catch((error) => {
      dbReady = null;
      console.error('Failed to initialize PostgreSQL schema:', error);
      throw error;
    });
  }
  return dbReady;
};

app.get('/api/ping', (_req, res) => {
  res.json({
    ok: true,
    vercel: Boolean(process.env.VERCEL),
    gemini: isGeminiConfigured(),
    googleAuth: Boolean((process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '').trim()),
  });
});

app.use(async (req, res, next) => {
  if (req.path === '/api/ping') return next();
  try {
    await ensureDb();
    next();
  } catch (error) {
    next(error);
  }
});

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, error: String(error) });
  }
});

app.get('/api/folders', async (req, res) => {
  try {
    const ownerId = String(req.query.ownerId || '');
    if (!ownerId) return res.status(400).json({ error: 'ownerId is required' });
    const result = await pool.query(
      'SELECT * FROM folders WHERE owner_id = $1 ORDER BY order_index ASC, created_at ASC',
      [ownerId]
    );
    res.json(result.rows.map(toFolder));
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/folders', async (req, res) => {
  try {
    const { id = crypto.randomUUID(), ownerId, name, order = 0 } = req.body || {};
    if (!ownerId || !name) return res.status(400).json({ error: 'ownerId and name are required' });
    const result = await pool.query(
      `INSERT INTO folders (id, owner_id, name, order_index)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, ownerId, name, order]
    );
    res.status(201).json(toFolder(result.rows[0]));
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.patch('/api/folders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, order, ownerId } = req.body || {};
    if (!ownerId) return res.status(400).json({ error: 'ownerId is required' });
    const result = await pool.query(
      `UPDATE folders
       SET name = COALESCE($2, name),
           order_index = COALESCE($3, order_index),
           updated_at = NOW()
       WHERE id = $1 AND owner_id = $4
       RETURNING *`,
      [id, name, Number.isFinite(order) ? order : null, ownerId]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Folder not found' });
    res.json(toFolder(result.rows[0]));
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.delete('/api/folders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = String(req.query.ownerId || req.body?.ownerId || '');
    if (!ownerId) return res.status(400).json({ error: 'ownerId is required' });
    const result = await pool.query('DELETE FROM folders WHERE id = $1 AND owner_id = $2', [id, ownerId]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Folder not found' });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/workspace/clear', async (req, res) => {
  try {
    const ownerId = String(req.body?.ownerId || '');
    if (!ownerId) return res.status(400).json({ error: 'ownerId is required' });
    await pool.query('DELETE FROM lesson_snapshots WHERE owner_id = $1', [ownerId]);
    await pool.query('DELETE FROM lessons WHERE owner_id = $1', [ownerId]);
    await pool.query('DELETE FROM folders WHERE owner_id = $1', [ownerId]);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/lessons', async (req, res) => {
  try {
    const ownerId = String(req.query.ownerId || '');
    if (!ownerId) return res.status(400).json({ error: 'ownerId is required' });
    const result = await pool.query(
      'SELECT * FROM lessons WHERE owner_id = $1 ORDER BY order_index ASC, created_at ASC',
      [ownerId]
    );
    res.json(result.rows.map(toLesson));
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/lessons', async (req, res) => {
  try {
    const { id = crypto.randomUUID(), folderId, ownerId, title, content = '', order = 0 } = req.body || {};
    if (!folderId || !ownerId || !title) {
      return res.status(400).json({ error: 'folderId, ownerId and title are required' });
    }
    const result = await pool.query(
      `INSERT INTO lessons (id, folder_id, owner_id, title, content, order_index)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, folderId, ownerId, title, content, order]
    );
    res.status(201).json(toLesson(result.rows[0]));
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.patch('/api/lessons/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { title, content, order, folderId, createSnapshot = false, triggerType = 'manual', ownerId } = req.body || {};
    if (!ownerId) {
      return res.status(400).json({ error: 'ownerId is required' });
    }
    await client.query('BEGIN');
    const result = await client.query(
      `UPDATE lessons
       SET title = COALESCE($2, title),
           content = COALESCE($3, content),
           order_index = COALESCE($4, order_index),
           folder_id = COALESCE($5, folder_id),
           updated_at = NOW()
       WHERE id = $1 AND owner_id = $6
       RETURNING *`,
      [id, title, content, Number.isFinite(order) ? order : null, folderId, ownerId]
    );
    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Lesson not found' });
    }
    const updatedLesson = result.rows[0];
    if (createSnapshot) {
      const lastSnap = await client.query(
        `SELECT title, content FROM lesson_snapshots
         WHERE lesson_id = $1
         ORDER BY created_at DESC
         LIMIT 1`,
        [updatedLesson.id]
      );
      const prev = lastSnap.rows[0];
      const changed =
        !prev ||
        prev.title !== updatedLesson.title ||
        prev.content !== updatedLesson.content;
      if (changed) {
        await client.query(
          `INSERT INTO lesson_snapshots (id, lesson_id, owner_id, title, content, trigger_type)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            crypto.randomUUID(),
            updatedLesson.id,
            updatedLesson.owner_id,
            updatedLesson.title,
            updatedLesson.content,
            triggerType,
          ]
        );
      }
    }
    await client.query('COMMIT');
    res.json(toLesson(result.rows[0]));
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: String(error) });
  } finally {
    client.release();
  }
});

app.get('/api/lessons/:id/snapshots', async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = String(req.query.ownerId || '');
    const limit = Math.max(1, Math.min(100, Number(req.query.limit || 30)));
    if (!ownerId) return res.status(400).json({ error: 'ownerId is required' });
    const result = await pool.query(
      `SELECT * FROM lesson_snapshots
       WHERE lesson_id = $1 AND owner_id = $2
       ORDER BY created_at DESC
       LIMIT $3`,
      [id, ownerId, limit]
    );
    res.json(result.rows.map(toSnapshot));
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/lessons/:id/restore/:snapshotId', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id, snapshotId } = req.params;
    const { ownerId } = req.body || {};
    if (!ownerId) return res.status(400).json({ error: 'ownerId is required' });
    await client.query('BEGIN');
    const snapRes = await client.query(
      `SELECT * FROM lesson_snapshots
       WHERE id = $1 AND lesson_id = $2 AND owner_id = $3`,
      [snapshotId, id, ownerId]
    );
    if (snapRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Snapshot not found' });
    }
    const snap = snapRes.rows[0];
    const lessonRes = await client.query(
      `UPDATE lessons
       SET title = $2, content = $3, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, snap.title, snap.content]
    );
    await client.query(
      `INSERT INTO lesson_snapshots (id, lesson_id, owner_id, title, content, trigger_type)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [crypto.randomUUID(), id, ownerId, snap.title, snap.content, 'restore']
    );
    await client.query('COMMIT');
    res.json(toLesson(lessonRes.rows[0]));
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: String(error) });
  } finally {
    client.release();
  }
});

app.post('/api/lessons/reorder', async (req, res) => {
  const client = await pool.connect();
  try {
    const { ownerId, folderId, lessonIds } = req.body || {};
    if (!ownerId || !folderId || !Array.isArray(lessonIds)) {
      return res.status(400).json({ error: 'ownerId, folderId and lessonIds[] are required' });
    }
    await client.query('BEGIN');
    for (let index = 0; index < lessonIds.length; index += 1) {
      await client.query(
        `UPDATE lessons
         SET order_index = $1, updated_at = NOW()
         WHERE id = $2 AND owner_id = $3 AND folder_id = $4`,
        [index, lessonIds[index], ownerId, folderId]
      );
    }
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: String(error) });
  } finally {
    client.release();
  }
});

app.delete('/api/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = String(req.query.ownerId || req.body?.ownerId || '');
    if (!ownerId) return res.status(400).json({ error: 'ownerId is required' });
    const result = await pool.query('DELETE FROM lessons WHERE id = $1 AND owner_id = $2', [id, ownerId]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Lesson not found' });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/lessons/:id/duplicate', async (req, res) => {
  try {
    const { id } = req.params;
    const { ownerId } = req.body || {};
    if (!ownerId) return res.status(400).json({ error: 'ownerId is required' });
    const source = await pool.query('SELECT * FROM lessons WHERE id = $1 AND owner_id = $2', [id, ownerId]);
    if (source.rowCount === 0) return res.status(404).json({ error: 'Lesson not found' });
    const row = source.rows[0];
    const newId = crypto.randomUUID();
    const result = await pool.query(
      `INSERT INTO lessons (id, folder_id, owner_id, title, content, order_index, tags, is_favorite)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false)
       RETURNING *`,
      [
        newId,
        row.folder_id,
        ownerId,
        `${row.title} (copy)`,
        row.content,
        Number(row.order_index) + 1,
        row.tags || [],
      ]
    );
    res.status(201).json(toLesson(result.rows[0]));
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.patch('/api/lessons/:id/meta', async (req, res) => {
  try {
    const { id } = req.params;
    const { ownerId, tags, isFavorite } = req.body || {};
    if (!ownerId) return res.status(400).json({ error: 'ownerId is required' });
    const result = await pool.query(
      `UPDATE lessons
       SET tags = COALESCE($3, tags),
           is_favorite = COALESCE($4, is_favorite),
           updated_at = NOW()
       WHERE id = $1 AND owner_id = $2
       RETURNING *`,
      [id, ownerId, Array.isArray(tags) ? tags : null, typeof isFavorite === 'boolean' ? isFavorite : null]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Lesson not found' });
    res.json(toLesson(result.rows[0]));
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/search', async (req, res) => {
  try {
    const ownerId = String(req.query.ownerId || '');
    const q = String(req.query.q || '').trim();
    if (!ownerId) return res.status(400).json({ error: 'ownerId is required' });
    if (!q) return res.json([]);
    const pattern = `%${q.replace(/[%_]/g, '')}%`;
    const result = await pool.query(
      `SELECT id, title, content FROM lessons
       WHERE owner_id = $1 AND (title ILIKE $2 OR content ILIKE $2)
       ORDER BY updated_at DESC
       LIMIT 40`,
      [ownerId, pattern]
    );
    res.json(result.rows.map((row) => ({ id: row.id, title: row.title, content: row.content })));
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/lessons/:id/share', async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = String(req.query.ownerId || '');
    if (!ownerId) return res.status(400).json({ error: 'ownerId is required' });
    const lesson = await pool.query('SELECT id FROM lessons WHERE id = $1 AND owner_id = $2', [id, ownerId]);
    if (lesson.rowCount === 0) return res.status(404).json({ error: 'Lesson not found' });

    const existing = await pool.query(
      `SELECT token, role, access, expires_at FROM lesson_shares
       WHERE lesson_id = $1 AND (expires_at IS NULL OR expires_at > NOW())
       ORDER BY created_at DESC
       LIMIT 1`,
      [id]
    );
    if (existing.rowCount > 0) {
      const row = existing.rows[0];
      return res.json({
        token: row.token,
        role: row.role,
        access: row.access,
        expiresAt: row.expires_at,
      });
    }

    const token = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    const shareId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 86400000).toISOString();
    await pool.query(
      `INSERT INTO lesson_shares (id, lesson_id, token, role, access, expires_at)
       VALUES ($1, $2, $3, 'viewer', 'anyone', $4)`,
      [shareId, id, token, expiresAt]
    );
    res.status(201).json({ token, role: 'viewer', access: 'anyone', expiresAt });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/lessons/:id/share', async (req, res) => {
  try {
    const { id } = req.params;
    const { ownerId, role = 'viewer', access = 'anyone', expiresInDays = 30 } = req.body || {};
    if (!ownerId) return res.status(400).json({ error: 'ownerId is required' });
    const lesson = await pool.query('SELECT id FROM lessons WHERE id = $1 AND owner_id = $2', [id, ownerId]);
    if (lesson.rowCount === 0) return res.status(404).json({ error: 'Lesson not found' });

    const existing = await pool.query(
      `SELECT id, token FROM lesson_shares
       WHERE lesson_id = $1 AND (expires_at IS NULL OR expires_at > NOW())
       ORDER BY created_at DESC
       LIMIT 1`,
      [id]
    );

    const expiresAt = expiresInDays
      ? new Date(Date.now() + Number(expiresInDays) * 86400000).toISOString()
      : null;

    if (existing.rowCount > 0) {
      const row = existing.rows[0];
      await pool.query(
        `UPDATE lesson_shares SET role = $2, access = $3, expires_at = $4 WHERE id = $1`,
        [row.id, role, access, expiresAt]
      );
      return res.json({ token: row.token, role, access, expiresAt });
    }

    const token = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    const shareId = crypto.randomUUID();
    await pool.query(
      `INSERT INTO lesson_shares (id, lesson_id, token, role, access, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [shareId, id, token, role, access, expiresAt]
    );
    res.status(201).json({ token, role, access, expiresAt });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/share/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const shareRes = await pool.query('SELECT * FROM lesson_shares WHERE token = $1', [token]);
    if (shareRes.rowCount === 0) return res.status(404).json({ error: 'Share link not found' });
    const share = shareRes.rows[0];
    if (share.expires_at && new Date(share.expires_at).getTime() < Date.now()) {
      return res.status(410).json({ error: 'Share link expired' });
    }
    const lessonRes = await pool.query(
      'SELECT id, folder_id, title, content FROM lessons WHERE id = $1',
      [share.lesson_id]
    );
    if (lessonRes.rowCount === 0) return res.status(404).json({ error: 'Lesson not found' });
    const lesson = lessonRes.rows[0];
    res.json({
      share: {
        token: share.token,
        lessonId: share.lesson_id,
        role: share.role,
        access: share.access,
        expiresAt: share.expires_at,
      },
      lesson: {
        id: lesson.id,
        folderId: lesson.folder_id,
        title: lesson.title,
        content: lesson.content,
      },
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/ai/status', (_req, res) => {
  res.json({ configured: isGeminiConfigured() });
});

app.post('/api/ai/format', async (req, res) => {
  try {
    const { content, lang = 'kh' } = req.body || {};
    const markdown = await geminiFormatMarkdown(String(content || ''), lang);
    res.json({ markdown });
  } catch (error) {
    const code = error.code || error.message;
    if (code === 'GEMINI_NOT_CONFIGURED') return res.status(503).json({ error: 'Gemini API not configured' });
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/ai/translate', async (req, res) => {
  try {
    const { content, targetLang = 'English' } = req.body || {};
    const markdown = await geminiTranslateMarkdown(String(content || ''), targetLang);
    res.json({ markdown });
  } catch (error) {
    if (error.code === 'GEMINI_NOT_CONFIGURED') return res.status(503).json({ error: 'Gemini API not configured' });
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/ai/generate-lesson', async (req, res) => {
  try {
    const { topic, lang = 'kh', level = 'general', includeQuiz = true } = req.body || {};
    if (!String(topic || '').trim()) return res.status(400).json({ error: 'topic is required' });
    const markdown = await geminiGenerateLesson({
      topic: String(topic).trim(),
      lang,
      level: String(level),
      includeQuiz: Boolean(includeQuiz),
    });
    res.json({ markdown });
  } catch (error) {
    if (error.code === 'GEMINI_NOT_CONFIGURED') return res.status(503).json({ error: 'Gemini API not configured' });
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/ai/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (!String(prompt || '').trim()) return res.status(400).json({ error: 'prompt is required' });
    const imageBytes = await geminiGenerateImage(String(prompt).trim());
    res.json({ imageBase64: imageBytes });
  } catch (error) {
    if (error.code === 'GEMINI_NOT_CONFIGURED') return res.status(503).json({ error: 'Gemini API not configured' });
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body || {};
    if (!credential) return res.status(400).json({ error: 'credential is required' });
    const profile = await verifyGoogleIdToken(String(credential));
    await pool.query(
      `INSERT INTO user_accounts (owner_id, email, name, picture, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (owner_id) DO UPDATE SET
         email = EXCLUDED.email,
         name = EXCLUDED.name,
         picture = EXCLUDED.picture,
         updated_at = NOW()`,
      [profile.ownerId, profile.email, profile.name, profile.picture]
    );
    res.json(profile);
  } catch (error) {
    if (error.code === 'GOOGLE_AUTH_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'Google Sign-In not configured' });
    }
    res.status(401).json({ error: String(error) });
  }
});

app.post('/api/workspace/migrate', async (req, res) => {
  const client = await pool.connect();
  try {
    const { fromOwnerId, toOwnerId } = req.body || {};
    if (!fromOwnerId || !toOwnerId || fromOwnerId === toOwnerId) {
      return res.status(400).json({ error: 'fromOwnerId and toOwnerId are required' });
    }
    if (!String(toOwnerId).startsWith('google:')) {
      return res.status(400).json({ error: 'toOwnerId must be a Google account' });
    }
    await client.query('BEGIN');
    await client.query('UPDATE folders SET owner_id = $2, updated_at = NOW() WHERE owner_id = $1', [
      fromOwnerId,
      toOwnerId,
    ]);
    await client.query('UPDATE lessons SET owner_id = $2, updated_at = NOW() WHERE owner_id = $1', [
      fromOwnerId,
      toOwnerId,
    ]);
    await client.query('UPDATE lesson_snapshots SET owner_id = $2 WHERE owner_id = $1', [fromOwnerId, toOwnerId]);
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: String(error) });
  } finally {
    client.release();
  }
});

app.get('/api/workspace/export', async (req, res) => {
  try {
    const ownerId = String(req.query.ownerId || '');
    if (!ownerId) return res.status(400).json({ error: 'ownerId is required' });
    const folders = await pool.query(
      'SELECT * FROM folders WHERE owner_id = $1 ORDER BY order_index ASC, created_at ASC',
      [ownerId]
    );
    const lessons = await pool.query(
      'SELECT * FROM lessons WHERE owner_id = $1 ORDER BY order_index ASC, created_at ASC',
      [ownerId]
    );
    res.json({
      version: 1,
      exportedAt: new Date().toISOString(),
      ownerId,
      folders: folders.rows.map(toFolder),
      lessons: lessons.rows.map(toLesson),
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/workspace/import', async (req, res) => {
  const client = await pool.connect();
  try {
    const { ownerId, data, mode = 'merge' } = req.body || {};
    if (!ownerId || !data?.folders || !data?.lessons) {
      return res.status(400).json({ error: 'ownerId and data.folders/lessons are required' });
    }
    await client.query('BEGIN');
    if (mode === 'replace') {
      await client.query('DELETE FROM lesson_snapshots WHERE owner_id = $1', [ownerId]);
      await client.query('DELETE FROM lessons WHERE owner_id = $1', [ownerId]);
      await client.query('DELETE FROM folders WHERE owner_id = $1', [ownerId]);
    }
    const folderIdMap = new Map();
    for (const folder of data.folders) {
      const newId = crypto.randomUUID();
      folderIdMap.set(folder.id, newId);
      await client.query(
        `INSERT INTO folders (id, owner_id, name, order_index)
         VALUES ($1, $2, $3, $4)`,
        [newId, ownerId, folder.name, Number(folder.order) || 0]
      );
    }
    for (const lesson of data.lessons) {
      const mappedFolderId = folderIdMap.get(lesson.folderId);
      if (!mappedFolderId) continue;
      await client.query(
        `INSERT INTO lessons (id, folder_id, owner_id, title, content, order_index, tags, is_favorite)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          crypto.randomUUID(),
          mappedFolderId,
          ownerId,
          lesson.title,
          lesson.content || '',
          Number(lesson.order) || 0,
          Array.isArray(lesson.tags) ? lesson.tags : [],
          Boolean(lesson.isFavorite),
        ]
      );
    }
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: String(error) });
  } finally {
    client.release();
  }
});

app.get('/api/folders/:id/classroom-share', async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = String(req.query.ownerId || '');
    if (!ownerId) return res.status(400).json({ error: 'ownerId is required' });
    const folder = await pool.query('SELECT * FROM folders WHERE id = $1 AND owner_id = $2', [id, ownerId]);
    if (folder.rowCount === 0) return res.status(404).json({ error: 'Folder not found' });

    const existing = await pool.query(
      `SELECT token, title, expires_at FROM classroom_shares
       WHERE folder_id = $1 AND (expires_at IS NULL OR expires_at > NOW())
       ORDER BY created_at DESC LIMIT 1`,
      [id]
    );
    if (existing.rowCount > 0) {
      const row = existing.rows[0];
      return res.json({ token: row.token, title: row.title, expiresAt: row.expires_at });
    }

    const token = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    const shareId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 90 * 86400000).toISOString();
    await pool.query(
      `INSERT INTO classroom_shares (id, folder_id, owner_id, token, title, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [shareId, id, ownerId, token, folder.rows[0].name, expiresAt]
    );
    res.status(201).json({ token, title: folder.rows[0].name, expiresAt });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/classroom/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const shareRes = await pool.query('SELECT * FROM classroom_shares WHERE token = $1', [token]);
    if (shareRes.rowCount === 0) return res.status(404).json({ error: 'Classroom not found' });
    const share = shareRes.rows[0];
    if (share.expires_at && new Date(share.expires_at).getTime() < Date.now()) {
      return res.status(410).json({ error: 'Classroom link expired' });
    }
    const lessonsRes = await pool.query(
      'SELECT id, folder_id, title, content, order_index FROM lessons WHERE folder_id = $1 ORDER BY order_index ASC',
      [share.folder_id]
    );
    res.json({
      classroom: {
        token: share.token,
        folderId: share.folder_id,
        title: share.title,
        expiresAt: share.expires_at,
      },
      lessons: lessonsRes.rows.map((row) => ({
        id: row.id,
        folderId: row.folder_id,
        title: row.title,
        content: row.content,
        order: row.order_index,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/classroom/:token/read', async (req, res) => {
  try {
    const { token } = req.params;
    const { lessonId, readerId } = req.body || {};
    if (!lessonId || !readerId) return res.status(400).json({ error: 'lessonId and readerId are required' });
    const shareRes = await pool.query('SELECT folder_id FROM classroom_shares WHERE token = $1', [token]);
    if (shareRes.rowCount === 0) return res.status(404).json({ error: 'Classroom not found' });
    const lesson = await pool.query('SELECT id FROM lessons WHERE id = $1 AND folder_id = $2', [
      lessonId,
      shareRes.rows[0].folder_id,
    ]);
    if (lesson.rowCount === 0) return res.status(404).json({ error: 'Lesson not found' });
    await pool.query(
      `INSERT INTO lesson_reads (id, share_token, lesson_id, reader_id)
       VALUES ($1, $2, $3, $4)`,
      [crypto.randomUUID(), token, lessonId, readerId]
    );
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/share/:token/quiz-submit', async (req, res) => {
  try {
    const { token } = req.params;
    const { lessonId, readerId, selectedIndex, isCorrect } = req.body || {};
    if (!lessonId || !readerId || typeof selectedIndex !== 'number') {
      return res.status(400).json({ error: 'lessonId, readerId, and selectedIndex are required' });
    }
    await pool.query(
      `INSERT INTO quiz_submissions (id, share_token, lesson_id, reader_id, selected_index, is_correct)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [crypto.randomUUID(), token, lessonId, readerId, selectedIndex, Boolean(isCorrect)]
    );
    res.json({ ok: true, isCorrect: Boolean(isCorrect) });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/folders/:id/classroom-stats', async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = String(req.query.ownerId || '');
    if (!ownerId) return res.status(400).json({ error: 'ownerId is required' });
    const shareRes = await pool.query(
      'SELECT token FROM classroom_shares WHERE folder_id = $1 AND owner_id = $2 ORDER BY created_at DESC LIMIT 1',
      [id, ownerId]
    );
    if (shareRes.rowCount === 0) return res.json({ reads: [], quizzes: [] });
    const token = shareRes.rows[0].token;
    const reads = await pool.query(
      `SELECT lesson_id, reader_id, read_at FROM lesson_reads WHERE share_token = $1 ORDER BY read_at DESC LIMIT 100`,
      [token]
    );
    const quizzes = await pool.query(
      `SELECT lesson_id, reader_id, selected_index, is_correct, submitted_at
       FROM quiz_submissions WHERE share_token = $1 ORDER BY submitted_at DESC LIMIT 100`,
      [token]
    );
    res.json({ token, reads: reads.rows, quizzes: quizzes.rows });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: String(error) });
});

export default app;

const isServerless = Boolean(process.env.VERCEL);
if (!isServerless) {
  ensureDb()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Postgres API running on http://localhost:${PORT} (${dbLabel})`);
      });
    })
    .catch((error) => {
      console.error('Failed to start API server:', error);
      process.exit(1);
    });
}

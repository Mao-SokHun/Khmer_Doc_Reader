import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createPool } from './db.js';

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
  res.json({ ok: true, vercel: Boolean(process.env.VERCEL) });
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
    const { name, order } = req.body || {};
    const result = await pool.query(
      `UPDATE folders
       SET name = COALESCE($2, name),
           order_index = COALESCE($3, order_index),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, name, Number.isFinite(order) ? order : null]
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
    await pool.query('DELETE FROM folders WHERE id = $1', [id]);
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
    const { title, content, order, folderId, createSnapshot = false, triggerType = 'manual' } = req.body || {};
    await client.query('BEGIN');
    const result = await client.query(
      `UPDATE lessons
       SET title = COALESCE($2, title),
           content = COALESCE($3, content),
           order_index = COALESCE($4, order_index),
           folder_id = COALESCE($5, folder_id),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, title, content, Number.isFinite(order) ? order : null, folderId]
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
    await pool.query('DELETE FROM lessons WHERE id = $1', [id]);
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

app.post('/api/lessons/:id/share', async (req, res) => {
  try {
    const { id } = req.params;
    const { ownerId, role = 'viewer', access = 'anyone', expiresInDays = 30 } = req.body || {};
    if (!ownerId) return res.status(400).json({ error: 'ownerId is required' });
    const lesson = await pool.query('SELECT id FROM lessons WHERE id = $1 AND owner_id = $2', [id, ownerId]);
    if (lesson.rowCount === 0) return res.status(404).json({ error: 'Lesson not found' });
    const token = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    const shareId = crypto.randomUUID();
    const expiresAt = expiresInDays
      ? new Date(Date.now() + Number(expiresInDays) * 86400000).toISOString()
      : null;
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

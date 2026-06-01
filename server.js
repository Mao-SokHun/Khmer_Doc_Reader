import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app = express();
const PORT = Number(process.env.API_PORT || 3001);

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || 'postgres',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '4944',
});

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
};

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

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Postgres API running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize PostgreSQL schema:', error);
    process.exit(1);
  });

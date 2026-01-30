import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// Get all chat messages
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, role, text, sources, EXTRACT(EPOCH FROM created_at) * 1000 as timestamp FROM chats ORDER BY created_at ASC'
    );
    res.json(result.rows.map(row => ({
      role: row.role,
      text: row.text,
      timestamp: Number(row.timestamp),
      sources: row.sources
    })));
  } catch (err) {
    console.error('Error fetching chats:', err);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

// Save chat messages (replace all)
router.post('/', async (req, res) => {
  const messages = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM chats');

    for (const msg of messages) {
      await client.query(
        'INSERT INTO chats (role, text, sources, created_at) VALUES ($1, $2, $3, to_timestamp($4 / 1000.0))',
        [msg.role, msg.text, msg.sources ? JSON.stringify(msg.sources) : null, msg.timestamp]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error saving chats:', err);
    res.status(500).json({ error: 'Failed to save chats' });
  } finally {
    client.release();
  }
});

// Clear all chats
router.delete('/', async (req, res) => {
  try {
    await pool.query('DELETE FROM chats');
    res.status(204).send();
  } catch (err) {
    console.error('Error clearing chats:', err);
    res.status(500).json({ error: 'Failed to clear chats' });
  }
});

export default router;

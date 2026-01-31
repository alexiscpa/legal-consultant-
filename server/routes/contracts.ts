import { Router } from 'express';
import pool from '../db.js';
import { authenticate, requireApproved } from '../middleware/auth.js';

const router = Router();

// All routes require authentication and approved status
router.use(authenticate);
router.use(requireApproved);

// Get all contracts
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, content, result, EXTRACT(EPOCH FROM created_at) * 1000 as timestamp FROM contracts ORDER BY created_at DESC'
    );
    res.json(result.rows.map(row => ({
      ...row,
      timestamp: Number(row.timestamp)
    })));
  } catch (err) {
    console.error('Error fetching contracts:', err);
    res.status(500).json({ error: 'Failed to fetch contracts' });
  }
});

// Create contract
router.post('/', async (req, res) => {
  const { title, content, result } = req.body;
  try {
    const queryResult = await pool.query(
      'INSERT INTO contracts (title, content, result) VALUES ($1, $2, $3) RETURNING id, title, content, result, EXTRACT(EPOCH FROM created_at) * 1000 as timestamp',
      [title, content, JSON.stringify(result)]
    );
    const row = queryResult.rows[0];
    res.status(201).json({
      ...row,
      timestamp: Number(row.timestamp)
    });
  } catch (err) {
    console.error('Error creating contract:', err);
    res.status(500).json({ error: 'Failed to create contract' });
  }
});

// Delete contract
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM contracts WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting contract:', err);
    res.status(500).json({ error: 'Failed to delete contract' });
  }
});

export default router;

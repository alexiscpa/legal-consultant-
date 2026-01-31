import { Router } from 'express';
import pool from '../db.js';
import { authenticate, requireApproved } from '../middleware/auth.js';

const router = Router();

// All routes require authentication and approved status
router.use(authenticate);
router.use(requireApproved);

// Get all scenarios
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, category, description, advice, EXTRACT(EPOCH FROM created_at) * 1000 as timestamp FROM scenarios ORDER BY created_at DESC'
    );
    res.json(result.rows.map(row => ({
      ...row,
      timestamp: Number(row.timestamp)
    })));
  } catch (err) {
    console.error('Error fetching scenarios:', err);
    res.status(500).json({ error: 'Failed to fetch scenarios' });
  }
});

// Create scenario
router.post('/', async (req, res) => {
  const { title, category, description, advice } = req.body;
  try {
    const queryResult = await pool.query(
      'INSERT INTO scenarios (title, category, description, advice) VALUES ($1, $2, $3, $4) RETURNING id, title, category, description, advice, EXTRACT(EPOCH FROM created_at) * 1000 as timestamp',
      [title, category, description, advice]
    );
    const row = queryResult.rows[0];
    res.status(201).json({
      ...row,
      timestamp: Number(row.timestamp)
    });
  } catch (err) {
    console.error('Error creating scenario:', err);
    res.status(500).json({ error: 'Failed to create scenario' });
  }
});

// Delete scenario
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM scenarios WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting scenario:', err);
    res.status(500).json({ error: 'Failed to delete scenario' });
  }
});

export default router;

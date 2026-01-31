import { Router, Response } from 'express';
import pool from '../db.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// GET /api/users - Get all users
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.email, u.name, u.role, u.status, u.created_at,
             u.approved_at, u.last_login,
             approver.name as approved_by_name
      FROM users u
      LEFT JOIN users approver ON u.approved_by = approver.id
      ORDER BY u.created_at DESC
    `);

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/users/pending - Get pending users
router.get('/pending', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT id, email, name, role, status, created_at
      FROM users
      WHERE status = 'pending'
      ORDER BY created_at ASC
    `);

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get pending users error:', error);
    res.status(500).json({ error: 'Failed to fetch pending users' });
  }
});

// PATCH /api/users/:id/approve - Approve a user
router.patch('/:id/approve', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if user exists and is pending
    const existing = await pool.query(
      'SELECT id, status FROM users WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (existing.rows[0].status !== 'pending') {
      return res.status(400).json({ error: 'User is not in pending status' });
    }

    // Approve the user
    const result = await pool.query(
      `UPDATE users
       SET status = 'approved', approved_by = $1, approved_at = NOW()
       WHERE id = $2
       RETURNING id, email, name, role, status, approved_at`,
      [req.user!.id, id]
    );

    res.json({
      message: 'User approved successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ error: 'Failed to approve user' });
  }
});

// PATCH /api/users/:id/reject - Reject a user
router.patch('/:id/reject', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if user exists and is pending
    const existing = await pool.query(
      'SELECT id, status FROM users WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (existing.rows[0].status !== 'pending') {
      return res.status(400).json({ error: 'User is not in pending status' });
    }

    // Reject the user
    const result = await pool.query(
      `UPDATE users
       SET status = 'rejected', approved_by = $1, approved_at = NOW()
       WHERE id = $2
       RETURNING id, email, name, role, status`,
      [req.user!.id, id]
    );

    res.json({
      message: 'User rejected',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({ error: 'Failed to reject user' });
  }
});

// DELETE /api/users/:id - Delete a user
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (id === req.user!.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Check if user exists
    const existing = await pool.query(
      'SELECT id, role FROM users WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting other admins (optional safeguard)
    if (existing.rows[0].role === 'admin') {
      return res.status(400).json({ error: 'Cannot delete admin users' });
    }

    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;

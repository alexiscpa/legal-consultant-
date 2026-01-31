import { Router, Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../db.js';
import { authenticate, generateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/register - User registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password and name are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if email already exists
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, role, status)
       VALUES ($1, $2, $3, 'user', 'pending')
       RETURNING id, email, name, role, status, created_at`,
      [email.toLowerCase(), passwordHash, name]
    );

    res.status(201).json({
      message: 'Registration successful. Please wait for admin approval.',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login - User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const result = await pool.query(
      'SELECT id, email, password_hash, name, role, status FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Generate token
    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/logout - User logout
router.post('/logout', authenticate, async (req: AuthRequest, res: Response) => {
  // In a JWT-based system, logout is handled client-side by removing the token
  // Server-side logout could invalidate tokens using a blacklist if needed
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me - Get current user
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, email, name, role, status, created_at, approved_at, last_login
       FROM users WHERE id = $1`,
      [req.user!.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

export default router;

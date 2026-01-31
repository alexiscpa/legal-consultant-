import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'default-jwt-secret-change-in-production';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  status: 'pending' | 'approved' | 'rejected';
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const result = await pool.query(
      'SELECT id, email, name, role, status FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const requireApproved = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  if (req.user.role === 'admin') {
    next();
    return;
  }

  if (req.user.status !== 'approved') {
    res.status(403).json({
      error: 'Account not approved',
      status: req.user.status
    });
    return;
  }

  next();
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  next();
};

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });
};

export { JWT_SECRET };

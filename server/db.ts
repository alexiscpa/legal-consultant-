import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

export const initDb = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'user',
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        approved_by UUID REFERENCES users(id),
        approved_at TIMESTAMP,
        last_login TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS contracts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        result JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS scenarios (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        advice TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS chats (
        id SERIAL PRIMARY KEY,
        role VARCHAR(10) NOT NULL,
        text TEXT NOT NULL,
        sources JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Database tables initialized');

    // Seed default admin account if not exists
    const adminEmail = 'admin@legalpro.com';
    const existingAdmin = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [adminEmail]
    );

    if (existingAdmin.rows.length === 0) {
      const passwordHash = await bcrypt.hash('Admin123!', 10);
      await client.query(
        `INSERT INTO users (email, password_hash, name, role, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [adminEmail, passwordHash, 'System Admin', 'admin', 'approved']
      );
      console.log('Default admin account created: admin@legalpro.com');
    }
  } finally {
    client.release();
  }
};

export default pool;

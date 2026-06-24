import { Pool } from 'pg';

export default async function handler(req, res) {
  // Use the connection string Vercel provided
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    if (req.method === 'POST') {
      const { section, content } = req.body;
      await pool.query('INSERT INTO canvas_entries (section, content) VALUES ($1, $2)', [section, content]);
      return res.status(200).json({ success: true });
    } 
    
    if (req.method === 'GET') {
      const { rows } = await pool.query('SELECT * FROM canvas_entries ORDER BY created_at DESC');
      return res.status(200).json(rows);
    }
  } catch (error) {
    // Return error to see exactly why it fails in the Network tab
    return res.status(500).json({ error: error.message });
  }
}

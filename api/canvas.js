import { Pool } from 'pg';

export default async function handler(req, res) {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
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
    return res.status(500).json({ error: error.message });
  }
}

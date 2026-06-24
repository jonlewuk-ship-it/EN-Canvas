import { Pool } from 'pg';

export default async function handler(req, res) {
  // Check for the most common connection string keys
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  
  const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
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
    // This will help us identify the specific error in the Network Response tab
    return res.status(500).json({ error: error.toString(), stack: error.stack });
  }
}

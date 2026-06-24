import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Content-Type', 'application/json');

  const { method } = req;

  try {
    if (method === 'GET') {
      const { rows } = await pool.query('SELECT * FROM canvas_entries ORDER BY created_at ASC');
      return res.status(200).json(rows);
    } 
    
    else if (method === 'POST') {
      const { id, section, content, color } = req.body;
      
      if (id) {
        // Explicitly updating content AND color for edits
        await pool.query(
          'UPDATE canvas_entries SET content = $1, color = $3 WHERE id = $2', 
          [content, id, color]
        );
      } else {
        // Creating new entry with color
        await pool.query(
          'INSERT INTO canvas_entries (section, content, color) VALUES ($1, $2, $3)', 
          [section, content, color]
        );
      }
      return res.status(200).json({ success: true });
    } 
    
    else if (method === 'DELETE') {
      const { id } = req.body;
      await pool.query('DELETE FROM canvas_entries WHERE id = $1', [id]);
      return res.status(200).json({ success: true });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

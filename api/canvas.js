import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  
  try {
    if (req.method === 'GET') {
      const { rows } = await pool.query('SELECT * FROM canvas_entries ORDER BY created_at ASC');
      return res.status(200).json(rows);
    } 
    
    if (req.method === 'POST') {
      const { id, section, content, color } = req.body;
      
      if (id) {
        // Ensure column order matches the array [content, color, id]
        await pool.query('UPDATE canvas_entries SET content = $1, color = $2 WHERE id = $3', [content, color, id]);
      } else {
        await pool.query('INSERT INTO canvas_entries (section, content, color) VALUES ($1, $2, $3)', [section, content, color]);
      }
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      await pool.query('DELETE FROM canvas_entries WHERE id = $1', [req.body.id]);
      return res.status(200).json({ success: true });
    }
  } catch (error) {
    // This will appear in your Vercel logs/console if the SQL fails
    console.error("DATABASE ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
}

import { Pool } from 'pg';

// Initialize connection
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  // 1. Mandatory Headers to prevent browser caching
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Content-Type', 'application/json');

  const { method } = req;

  try {
    // 2. FETCH: Retrieve all entries
    if (method === 'GET') {
      const { rows } = await pool.query('SELECT * FROM canvas_entries ORDER BY created_at ASC');
      return res.status(200).json(rows);
    } 
    
    // 3. CREATE / UPDATE: Handle both new entries and edits
    else if (method === 'POST') {
      const { id, section, content } = req.body;
      
      if (id) {
        // Edit existing entry
        await pool.query('UPDATE canvas_entries SET content = $1 WHERE id = $2', [content, id]);
      } else {
        // Create new entry
        await pool.query('INSERT INTO canvas_entries (section, content) VALUES ($1, $2)', [section, content]);
      }
      return res.status(200).json({ success: true });
    } 
    
    // 4. DELETE: Remove entry by ID
    else if (method === 'DELETE') {
      const { id } = req.body;
      await pool.query('DELETE FROM canvas_entries WHERE id = $1', [id]);
      return res.status(200).json({ success: true });
    }
    
    else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}

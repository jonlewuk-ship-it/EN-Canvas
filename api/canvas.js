import { Pool } from 'pg';

// Configurazione connessione database (usa le tue variabili d'ambiente)
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  // Disabilita la cache per assicurare aggiornamenti in tempo reale
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  
  const { method } = req;

  try {
    if (method === 'GET') {
      const { rows } = await pool.query('SELECT * FROM canvas_entries ORDER BY created_at ASC');
      return res.status(200).json(rows);
    } 
    
    else if (method === 'POST') {
      const { id, section, content } = req.body;
      if (id) {
        // Logica per EDIT (Update)
        await pool.query('UPDATE canvas_entries SET content = $1 WHERE id = $2', [content, id]);
      } else {
        // Logica per CREATE (Insert)
        await pool.query('INSERT INTO canvas_entries (section, content) VALUES ($1, $2)', [section, content]);
      }
      return res.status(200).json({ success: true });
    } 
    
    else if (method === 'DELETE') {
      const { id } = req.body;
      await pool.query('DELETE FROM canvas_entries WHERE id = $1', [id]);
      return res.status(200).json({ success: true });
    }
  } catch (error) {
    console.error("Errore API:", error);
    return res.status(500).json({ error: error.message });
  }
}

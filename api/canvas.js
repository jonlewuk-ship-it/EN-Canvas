import { Client } from 'pg';

export default async function handler(req, res) {
  // Use the exact POSTGRES_URL provided by your Neon dashboard
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();

    if (req.method === 'POST') {
      const { section, content } = req.body;
      await client.query('INSERT INTO canvas_entries (section, content) VALUES ($1, $2)', [section, content]);
      return res.status(200).json({ success: true });
    } 
    
    if (req.method === 'GET') {
      const { rows } = await client.query('SELECT * FROM canvas_entries ORDER BY created_at DESC');
      return res.status(200).json(rows);
    }
  } catch (error) {
    console.error("Database connection error:", error);
    return res.status(500).json({ error: error.message });
  } finally {
    await client.end();
  }
}

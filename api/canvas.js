import { Client } from 'pg';

export default async function handler(req, res) {
  // Ensure we are using the environment variable Vercel assigned to your project
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false } // Required for Neon/Vercel Postgres
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
    console.error("Database error:", error);
    return res.status(500).json({ error: error.message });
  } finally {
    await client.end();
  }
}

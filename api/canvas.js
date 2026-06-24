import { Client } from 'pg';

export default async function handler(req, res) {
  const client = new Client({ connectionString: process.env.POSTGRES_URL });
  await client.connect();

  if (req.method === 'POST') {
    const { section, content } = req.body;
    await client.query('INSERT INTO canvas_entries (section, content) VALUES ($1, $2)', [section, content]);
    await client.end();
    return res.status(200).json({ success: true });
  } 
  
  if (req.method === 'GET') {
    const { rows } = await client.query('SELECT * FROM canvas_entries ORDER BY created_at DESC');
    await client.end();
    return res.status(200).json(rows);
  }
}

import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Use the connection string Vercel automatically provided to your project
  const sql = neon(process.env.POSTGRES_URL);

  if (req.method === 'POST') {
    const { section, content, parent_id } = req.body;
    await sql`INSERT INTO canvas_entries (section, content, parent_id) VALUES (${section}, ${content}, ${parent_id || null})`;
    return res.status(200).json({ success: true });
  }

  if (req.method === 'GET') {
    const data = await sql`SELECT * FROM canvas_entries ORDER BY created_at DESC`;
    return res.status(200).json(data);
  }
}

import pool from '@/lib/db';

export async function GET(req: Request) {
  const [rows] = await pool.query('SELECT * FROM users');

  return new Response(JSON.stringify(rows), {
    headers: { 'Content-Type': 'application/json' },
  });
}

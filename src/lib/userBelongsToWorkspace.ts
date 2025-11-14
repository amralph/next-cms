import { redirect } from 'next/navigation';
import pool from '@/lib/db';
import { Workspace } from '@/types/extendsRowDataPacket';

export async function authorizeWorkspaceOrRedirect(
  sub: string,
  workspaceId: string,
  redirectUrl: string
) {
  try {
    const [rows] = await pool.query<Workspace[]>(
      `
        SELECT w.* 
        FROM workspaces w
        JOIN users u ON w.user_id = u.id
        WHERE u.cognito_user_id = ? AND w.id = ?
      `,
      [sub, workspaceId]
    );

    const workspace = rows[0];

    if (!workspace) {
      redirect(redirectUrl);
    }
  } catch (e) {
    redirect(redirectUrl);
  }
}

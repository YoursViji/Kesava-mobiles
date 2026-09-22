import { createServerOnlyFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { currentUser } from '@/lib/session.server'
import { user as userTable } from '@/db/schema'

/** Guard for every admin server function: throws unless the signed-in user carries the admin role.
 * Server-only so the published site never bundles the session lookup into the public pages. */
export const requireAdmin = createServerOnlyFn(async () => {
  const authedUser = await currentUser()
  if (!authedUser) throw new Error('Please sign in to continue')
  const db = await getDb()
  const row = await db.select().from(userTable).where(eq(userTable.id, authedUser.id)).get()
  if (row?.role !== 'admin') throw new Error('Your account is not authorized to view the admin panel')
  return authedUser
})

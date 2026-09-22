import { createServerFn } from '@tanstack/react-start'
import { count, eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { getAuth } from '@/lib/auth'
import { currentUser } from '@/lib/session.server'
import { user as userTable, products, orders, serviceBookings, preBookings, demoBookings } from '@/db/schema'
import { ADMIN_EMAIL } from '@/data/options'
import { requireAdmin } from '@/server/admin-guard.server'

const ADMIN_PASSWORD = 'Admin@kesava-mobiles'
const ADMIN_NAME = 'Kesava Mobiles Admin'

/** Makes sure the one static admin account exists and carries the 'admin' role. Safe to call every time the
 * admin login page loads: it is a no-op once the account is there. */
export const ensureAdminAccount = createServerFn({ method: 'GET' }).handler(async () => {
  const db = await getDb()
  const existing = await db.select().from(userTable).where(eq(userTable.email, ADMIN_EMAIL)).get()
  if (existing) {
    if (existing.role !== 'admin') {
      await db.update(userTable).set({ role: 'admin' }).where(eq(userTable.id, existing.id))
    }
    return { ok: true }
  }
  const auth = await getAuth()
  await auth.api.signUpEmail({ body: { name: ADMIN_NAME, email: ADMIN_EMAIL, password: ADMIN_PASSWORD } })
  const created = await db.select().from(userTable).where(eq(userTable.email, ADMIN_EMAIL)).get()
  if (created) {
    await db.update(userTable).set({ role: 'admin' }).where(eq(userTable.id, created.id))
  }
  return { ok: true }
})

export const checkIsAdmin = createServerFn({ method: 'GET' }).handler(async () => {
  const authedUser = await currentUser()
  if (!authedUser) return { isAdmin: false }
  const db = await getDb()
  const row = await db.select().from(userTable).where(eq(userTable.id, authedUser.id)).get()
  return { isAdmin: row?.role === 'admin' }
})

export const adminDashboardStats = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  const db = await getDb()
  const [productCount] = await db.select({ n: count() }).from(products)
  const [outOfStock] = await db.select({ n: count() }).from(products).where(eq(products.inStock, false))
  const [orderCount] = await db.select({ n: count() }).from(orders)
  const [openServices] = await db
    .select({ n: count() })
    .from(serviceBookings)
    .where(eq(serviceBookings.status, 'received'))
  const [pendingPreBookings] = await db.select({ n: count() }).from(preBookings).where(eq(preBookings.status, 'pending'))
  const [upcomingDemos] = await db.select({ n: count() }).from(demoBookings).where(eq(demoBookings.status, 'confirmed'))

  return {
    productCount: productCount?.n ?? 0,
    outOfStock: outOfStock?.n ?? 0,
    orderCount: orderCount?.n ?? 0,
    openServices: openServices?.n ?? 0,
    pendingPreBookings: pendingPreBookings?.n ?? 0,
    upcomingDemos: upcomingDemos?.n ?? 0,
  }
})

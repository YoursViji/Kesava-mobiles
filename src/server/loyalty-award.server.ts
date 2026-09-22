import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { loyaltyAccounts } from '@/db/schema'
import { RUPEES_PER_POINT } from '@/server/loyalty'

function makeReferralCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return `KM-REF-${code}`
}

async function ensureAccount(db: Awaited<ReturnType<typeof getDb>>, phone: string) {
  const existing = await db.select().from(loyaltyAccounts).where(eq(loyaltyAccounts.phone, phone)).get()
  if (existing) return existing
  let referralCode = makeReferralCode()
  let clash = await db.select().from(loyaltyAccounts).where(eq(loyaltyAccounts.referralCode, referralCode)).get()
  let attempts = 0
  while (clash && attempts < 10) {
    referralCode = makeReferralCode()
    clash = await db.select().from(loyaltyAccounts).where(eq(loyaltyAccounts.referralCode, referralCode)).get()
    attempts++
  }
  const row = {
    id: crypto.randomUUID(),
    phone,
    points: 0,
    referralCode,
    usedReferralCode: null as string | null,
    createdAt: new Date().toISOString(),
  }
  await db.insert(loyaltyAccounts).values(row)
  return row
}

/** Credits points after a purchase or a paid repair. Callers treat a throw as best-effort. */
export async function awardLoyaltyPoints(phone: string, amountSpent: number) {
  if (amountSpent <= 0) return
  const db = await getDb()
  const account = await ensureAccount(db, phone)
  const earned = Math.floor(amountSpent / RUPEES_PER_POINT)
  if (earned <= 0) return
  await db.update(loyaltyAccounts).set({ points: account.points + earned }).where(eq(loyaltyAccounts.id, account.id))
}

import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '@/lib/db'
import { loyaltyAccounts } from '@/db/schema'

// 1 point for every ₹100 spent on a phone, accessory or repair; each point is worth ₹1 in-store.
export const RUPEES_PER_POINT = 100
export const REFERRAL_BONUS_POINTS = 100

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

export const getLoyaltyStatus = createServerFn({ method: 'GET' })
  .validator((phone: string) => phone.trim())
  .handler(async ({ data: phone }) => {
    const db = await getDb()
    const account = await ensureAccount(db, phone)
    return {
      points: account.points,
      referralCode: account.referralCode,
      usedReferralCode: account.usedReferralCode,
      redeemableRupees: account.points,
    }
  })

const redeemSchema = z.object({
  phone: z.string().min(10, 'Please enter a valid 10-digit phone number').max(15),
  referralCode: z.string().min(4, 'Please enter a referral code'),
})

export const redeemReferralCode = createServerFn({ method: 'POST' })
  .validator(redeemSchema)
  .handler(async ({ data }) => {
    const db = await getDb()
    const code = data.referralCode.trim().toUpperCase()
    const account = await ensureAccount(db, data.phone)
    if (account.usedReferralCode) {
      return { ok: false as const, message: 'You have already used a referral code on this number.' }
    }
    if (account.referralCode === code) {
      return { ok: false as const, message: "You can't use your own referral code." }
    }
    const referrer = await db.select().from(loyaltyAccounts).where(eq(loyaltyAccounts.referralCode, code)).get()
    if (!referrer) {
      return { ok: false as const, message: 'That referral code was not found.' }
    }
    await db.update(loyaltyAccounts).set({ usedReferralCode: code }).where(eq(loyaltyAccounts.id, account.id))
    await db
      .update(loyaltyAccounts)
      .set({ points: referrer.points + REFERRAL_BONUS_POINTS })
      .where(eq(loyaltyAccounts.id, referrer.id))
    return { ok: true as const, bonus: REFERRAL_BONUS_POINTS }
  })
